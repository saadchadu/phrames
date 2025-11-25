import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { logCampaignDeactivated, logCampaignReactivated, logCampaignExtended, logCampaignDeleted } from '@/lib/admin-logging';

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const paymentType = searchParams.get('paymentType');
    const userId = searchParams.get('userId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    let query: admin.firestore.Query = db.collection('campaigns');

    // Apply filters
    if (userId) {
      query = query.where('createdBy', '==', userId);
    }

    if (status === 'active') {
      query = query.where('isActive', '==', true);
    } else if (status === 'inactive') {
      query = query.where('isActive', '==', false);
    }

    if (paymentType === 'free') {
      query = query.where('isFreeCampaign', '==', true);
    } else if (paymentType === 'paid') {
      query = query.where('isFreeCampaign', '==', false);
    }

    const snapshot = await query.get();
    
    let campaigns = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: toDate(data.createdAt)?.toISOString(),
        expiresAt: toDate(data.expiresAt)?.toISOString(),
        lastPaymentAt: toDate(data.lastPaymentAt)?.toISOString(),
      };
    });

    // Apply search filter (client-side since Firestore doesn't support full-text search)
    if (search) {
      const searchLower = search.toLowerCase();
      campaigns = campaigns.filter(campaign => {
        const data = campaign as any;
        return (
          data.campaignName?.toLowerCase().includes(searchLower) ||
          data.slug?.toLowerCase().includes(searchLower) ||
          campaign.id.toLowerCase().includes(searchLower) ||
          data.createdBy?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply date range filters
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      campaigns = campaigns.filter(campaign => {
        const createdDate = campaign.createdAt ? new Date(campaign.createdAt) : null;
        return createdDate && createdDate >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      campaigns = campaigns.filter(campaign => {
        const createdDate = campaign.createdAt ? new Date(campaign.createdAt) : null;
        return createdDate && createdDate <= toDate;
      });
    }

    // Check expiry status
    const now = new Date();
    campaigns = campaigns.map(campaign => ({
      ...campaign,
      isExpired: campaign.expiresAt ? new Date(campaign.expiresAt) < now : false,
    }));

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, action, adminId, ...data } = body;

    if (!campaignId || !action || !adminId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const campaignRef = db.collection('campaigns').doc(campaignId);
    const campaignDoc = await campaignRef.get();

    if (!campaignDoc.exists) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaignData = campaignDoc.data();

    switch (action) {
      case 'deactivate':
        await campaignRef.update({ isActive: false });
        await logCampaignDeactivated(
          adminId,
          campaignId,
          campaignData?.campaignName || 'Unknown',
          data.reason
        );
        break;

      case 'reactivate':
        const newExpiryDate = data.expiresAt ? new Date(data.expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await campaignRef.update({
          isActive: true,
          status: 'Active',
          expiresAt: admin.firestore.Timestamp.fromDate(newExpiryDate),
        });
        await logCampaignReactivated(
          adminId,
          campaignId,
          campaignData?.campaignName || 'Unknown',
          newExpiryDate
        );
        break;

      case 'extend':
        const currentExpiry = toDate(campaignData?.expiresAt) || new Date();
        const daysToAdd = data.days || 30;
        const extendedExpiry = new Date(currentExpiry.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
        
        await campaignRef.update({
          expiresAt: admin.firestore.Timestamp.fromDate(extendedExpiry),
        });
        await logCampaignExtended(
          adminId,
          campaignId,
          campaignData?.campaignName || 'Unknown',
          currentExpiry,
          extendedExpiry,
          daysToAdd
        );
        break;

      case 'setExpiry':
        if (!data.expiresAt) {
          return NextResponse.json(
            { error: 'Missing expiresAt date' },
            { status: 400 }
          );
        }
        const customExpiry = new Date(data.expiresAt);
        const oldExpiry = toDate(campaignData?.expiresAt) || new Date();
        
        await campaignRef.update({
          expiresAt: admin.firestore.Timestamp.fromDate(customExpiry),
        });
        await logCampaignExtended(
          adminId,
          campaignId,
          campaignData?.campaignName || 'Unknown',
          oldExpiry,
          customExpiry,
          Math.round((customExpiry.getTime() - oldExpiry.getTime()) / (24 * 60 * 60 * 1000))
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaignId');
    const adminId = searchParams.get('adminId');

    if (!campaignId || !adminId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const campaignRef = db.collection('campaigns').doc(campaignId);
    const campaignDoc = await campaignRef.get();

    if (!campaignDoc.exists) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaignData = campaignDoc.data();
    
    await campaignRef.delete();
    await logCampaignDeleted(
      adminId,
      campaignId,
      campaignData?.campaignName || 'Unknown',
      campaignData?.createdBy || 'Unknown'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
