import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import type { Query } from 'firebase-admin/firestore';
import { logCampaignDeactivated, logCampaignReactivated, logCampaignExtended, logCampaignDeleted } from '@/lib/admin-logging-server';

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const paymentType = searchParams.get('paymentType');
    const visibility = searchParams.get('visibility');
    const supporters = searchParams.get('supporters');
    const userId = searchParams.get('userId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    let query: Query = db.collection('campaigns');

    // Apply filters
    if (userId) {
      query = query.where('createdBy', '==', userId);
    }

    // Note: 'active' and 'expired' are filtered client-side after computing isExpired
    // Only 'inactive' can be safely pre-filtered at Firestore level
    if (status === 'inactive') {
      query = query.where('isActive', '==', false);
    }

    if (paymentType === 'free') {
      query = query.where('isFreeCampaign', '==', true);
    } else if (paymentType === 'paid') {
      query = query.where('isFreeCampaign', '==', false);
    }

    if (visibility === 'public') {
      query = query.where('visibility', '==', 'Public');
    } else if (visibility === 'unlisted') {
      query = query.where('visibility', '==', 'Unlisted');
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

    // Apply supporters range filter (client-side — Firestore range can't combine with other where clauses)
    if (supporters) {
      campaigns = campaigns.filter((campaign: any) => {
        const count = campaign.supportersCount ?? 0;
        if (supporters === '0') return count === 0;
        if (supporters === '1-50') return count >= 1 && count <= 50;
        if (supporters === '51-100') return count >= 51 && count <= 100;
        if (supporters === '101-500') return count >= 101 && count <= 500;
        if (supporters === '501-1000') return count >= 501 && count <= 1000;
        if (supporters === '1001-5000') return count >= 1001 && count <= 5000;
        if (supporters === '5000+') return count > 5000;
        return true;
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

    // Check expiry status — must happen before status filtering because
    // isExpired is a derived field (expiresAt < now), not stored in Firestore
    const now = new Date();
    campaigns = campaigns.map(campaign => ({
      ...campaign,
      isExpired: campaign.expiresAt ? new Date(campaign.expiresAt) < now : false,
    }));

    // Apply expired / active status filter AFTER computing isExpired
    if (status === 'expired') {
      campaigns = campaigns.filter((c: any) => c.isExpired);
    } else if (status === 'active') {
      // "Active" means isActive=true AND not expired
      campaigns = campaigns.filter((c: any) => c.isActive && !c.isExpired);
    }
    // 'inactive' was already filtered at the Firestore level above

    // For inactive paid campaigns, check if they have a pending payment
    // (user clicked pay but didn't complete it)
    const inactivePaidCampaignIds = campaigns
      .filter((c: any) => !c.isActive && !c.isFreeCampaign)
      .map((c: any) => c.id);

    const pendingPaymentCampaignIds = new Set<string>();

    if (inactivePaidCampaignIds.length > 0) {
      // Firestore 'in' query supports up to 30 items; chunk if needed
      const chunks: string[][] = [];
      for (let i = 0; i < inactivePaidCampaignIds.length; i += 30) {
        chunks.push(inactivePaidCampaignIds.slice(i, i + 30));
      }
      for (const chunk of chunks) {
        const pendingSnap = await db.collection('payments')
          .where('campaignId', 'in', chunk)
          .where('status', '==', 'pending')
          .get();
        pendingSnap.docs.forEach(doc => {
          pendingPaymentCampaignIds.add(doc.data().campaignId);
        });
      }
    }

    campaigns = campaigns.map((campaign: any) => ({
      ...campaign,
      hasPendingPayment: pendingPaymentCampaignIds.has(campaign.id),
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
          expiresAt: Timestamp.fromDate(newExpiryDate),
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
          expiresAt: Timestamp.fromDate(extendedExpiry),
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
          expiresAt: Timestamp.fromDate(customExpiry),
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
