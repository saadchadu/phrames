import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { logManualCronTrigger, logDataExport } from '@/lib/admin-logging-server';

const db = adminDb;

// Helper to safely convert Firestore timestamp to Date
function toDate(timestamp: any): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp.toDate === 'function') return timestamp.toDate();
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }
  if (typeof timestamp === 'number') return new Date(timestamp);
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, adminId } = body;

    if (!action || !adminId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'triggerExpiryCron':
        // Manually expire campaigns
        const now = new Date();
        const campaignsSnapshot = await db.collection('campaigns')
          .where('isActive', '==', true)
          .get();

        let expiredCount = 0;
        const batch = db.batch();

        campaignsSnapshot.docs.forEach(doc => {
          const expiresAt = toDate(doc.data().expiresAt);
          if (expiresAt && expiresAt < now) {
            batch.update(doc.ref, { isActive: false });
            expiredCount++;
          }
        });

        await batch.commit();
        await logManualCronTrigger(adminId, 'campaign-expiry');

        return NextResponse.json({ 
          success: true, 
          message: `Expired ${expiredCount} campaigns` 
        });

      case 'exportPayments':
        const paymentsSnapshot = await db.collection('payments').get();
        const payments = paymentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: toDate(doc.data().createdAt)?.toISOString(),
        }));

        await logDataExport(adminId, 'payments', payments.length);

        // Convert to CSV
        const paymentsCsv = convertToCSV(payments, [
          'id', 'userId', 'campaignId', 'amount', 'planType', 'status', 'createdAt'
        ]);

        return new NextResponse(paymentsCsv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="payments-${Date.now()}.csv"`,
          },
        });

      case 'exportCampaigns':
        const allCampaignsSnapshot = await db.collection('campaigns').get();
        const campaigns = allCampaignsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: toDate(doc.data().createdAt)?.toISOString(),
          expiresAt: toDate(doc.data().expiresAt)?.toISOString(),
        }));

        await logDataExport(adminId, 'campaigns', campaigns.length);

        // Convert to CSV
        const campaignsCsv = convertToCSV(campaigns, [
          'id', 'campaignName', 'slug', 'createdBy', 'isActive', 'isFreeCampaign', 
          'planType', 'amountPaid', 'createdAt', 'expiresAt'
        ]);

        return new NextResponse(campaignsCsv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="campaigns-${Date.now()}.csv"`,
          },
        });

      case 'fixStuckCampaigns':
        // Find campaigns that should be active but aren't
        const inactiveCampaignsSnapshot = await db.collection('campaigns')
          .where('isActive', '==', false)
          .get();

        let fixedCount = 0;
        const fixBatch = db.batch();

        for (const campaignDoc of inactiveCampaignsSnapshot.docs) {
          const campaignId = campaignDoc.id;
          const campaignData = campaignDoc.data();
          let shouldActivate = false;
          let updateData: any = {
            isActive: true,
            status: 'Active',
            lastPaymentAt: Timestamp.now()
          };
          
          // Check if there are successful payments for this campaign (paid campaigns)
          const successfulPaymentsSnapshot = await db.collection('payments')
            .where('campaignId', '==', campaignId)
            .where('status', '==', 'success')
            .limit(1)
            .get();

          if (!successfulPaymentsSnapshot.empty) {
            // This is a paid campaign with successful payment
            const payment = successfulPaymentsSnapshot.docs[0].data();
            shouldActivate = true;
            
            // Calculate expiry date
            const planDurations: { [key: string]: number } = {
              'week': 7,
              'month': 30,
              '3month': 90,
              '6month': 180,
              'year': 365
            };
            
            const days = planDurations[payment.planType];
            let expiryDate = null;
            if (days) {
              expiryDate = new Date();
              expiryDate.setDate(expiryDate.getDate() + days);
            }

            updateData = {
              ...updateData,
              isFreeCampaign: false,
              planType: payment.planType,
              amountPaid: payment.amount,
              paymentId: payment.orderId,
              expiresAt: expiryDate ? Timestamp.fromDate(expiryDate) : null,
            };
          } else {
            // Check if this should be a free campaign
            // Look for campaigns created by users who should have free campaigns
            const userId = campaignData.createdBy;
            if (userId) {
              const userDoc = await db.collection('users').doc(userId).get();
              const userData = userDoc.exists ? userDoc.data() : null;
              
              // If user hasn't used free campaign or if campaign was created as free
              if (!userData?.freeCampaignUsed || campaignData.isFreeCampaign === true) {
                shouldActivate = true;
                
                // Set as free campaign with 30-day expiry
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30);
                
                updateData = {
                  ...updateData,
                  isFreeCampaign: true,
                  planType: 'free',
                  amountPaid: 0,
                  paymentId: null,
                  expiresAt: Timestamp.fromDate(expiryDate),
                };
                
                // Mark user's free campaign as used if not already
                if (!userData?.freeCampaignUsed) {
                  if (userDoc.exists) {
                    fixBatch.update(userDoc.ref, { freeCampaignUsed: true });
                  } else {
                    fixBatch.set(userDoc.ref, {
                      uid: userId,
                      freeCampaignUsed: true,
                      createdAt: Timestamp.now()
                    });
                  }
                }
              }
            }
          }

          if (shouldActivate) {
            fixBatch.update(campaignDoc.ref, updateData);
            fixedCount++;
          }
        }

        await fixBatch.commit();

        // Log the action
        await db.collection('logs').add({
          eventType: 'bulk_campaign_fix',
          actorId: adminId,
          description: `Fixed ${fixedCount} stuck campaigns (both paid and free)`,
          metadata: { fixedCount },
          createdAt: Timestamp.now()
        });

        return NextResponse.json({ 
          success: true, 
          message: `Fixed ${fixedCount} stuck campaigns (both paid and free)` 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error executing action:', error);
    return NextResponse.json(
      { error: 'Failed to execute action' },
      { status: 500 }
    );
  }
}

function convertToCSV(data: any[], columns: string[]): string {
  const header = columns.join(',');
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}
