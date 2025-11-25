import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { logManualCronTrigger, logDataExport } from '@/lib/admin-logging';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

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
