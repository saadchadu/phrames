import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

const db = adminDb;

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

export async function GET(request: Request) {
  try {
    const authHeader = (request as any).headers?.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1]);
    if (decoded.isAdmin !== true) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all collections in parallel
    const [usersSnap, campaignsSnap, paymentsSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('campaigns').get(),
      db.collection('payments').get(),
    ]);

    // Calculate user stats
    const totalUsers = usersSnap.size;
    const usersToday = usersSnap.docs.filter(doc => {
      const createdAt = toDate(doc.data().createdAt);
      return createdAt && createdAt >= todayStart;
    }).length;

    // Calculate campaign stats
    const totalCampaigns = campaignsSnap.size;
    const activeCampaigns = campaignsSnap.docs.filter(doc => {
      const data = doc.data();
      return data.isActive === true;
    }).length;
    const expiredCampaigns = campaignsSnap.docs.filter(doc => {
      const data = doc.data();
      const expiresAt = toDate(data.expiresAt);
      return expiresAt && expiresAt < now;
    }).length;
    const freeCampaignsUsed = campaignsSnap.docs.filter(doc => {
      const data = doc.data();
      return data.isFreeCampaign === true;
    }).length;

    // Calculate revenue stats — only count payments that are SUCCESS and NOT refunded
    const isSuccessful = (data: any) =>
      (data.status === 'SUCCESS' || data.status === 'success') &&
      data.status !== 'refunded'

    const isRefunded = (data: any) => data.status === 'refunded'

    const successfulPayments = paymentsSnap.docs.filter(doc => isSuccessful(doc.data()))
    const refundedPayments = paymentsSnap.docs.filter(doc => isRefunded(doc.data()))

    const totalRevenue = successfulPayments.reduce((sum, doc) => {
      return sum + (doc.data().amount || 0);
    }, 0);

    const totalRefunded = refundedPayments.reduce((sum, doc) => {
      return sum + (doc.data().refundAmount || doc.data().amount || 0);
    }, 0);

    const netRevenue = Math.max(0, totalRevenue - totalRefunded);

    const todayRevenue = successfulPayments
      .filter(doc => {
        const createdAt = toDate(doc.data().createdAt);
        return createdAt && createdAt >= todayStart;
      })
      .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

    const last30DaysRevenue = successfulPayments
      .filter(doc => {
        const createdAt = toDate(doc.data().createdAt);
        return createdAt && createdAt >= thirtyDaysAgo;
      })
      .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

    // Calculate daily revenue for chart (last 30 days)
    const dailyRevenue: { date: string; revenue: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayRevenue = successfulPayments
        .filter(doc => {
          const createdAt = toDate(doc.data().createdAt);
          return createdAt && createdAt >= dayStart && createdAt < dayEnd;
        })
        .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

      dailyRevenue.push({ date: dateStr, revenue: dayRevenue });
    }

    // Calculate daily new users (last 30 days)
    const dailyNewUsers: { date: string; users: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayUsers = usersSnap.docs.filter(doc => {
        const createdAt = toDate(doc.data().createdAt);
        return createdAt && createdAt >= dayStart && createdAt < dayEnd;
      }).length;

      dailyNewUsers.push({ date: dateStr, users: dayUsers });
    }

    // Calculate plan distribution
    const planDistribution: { [key: string]: number } = {
      week: 0,
      month: 0,
      '3month': 0,
      '6month': 0,
      year: 0,
    };

    successfulPayments.forEach(doc => {
      const planType = doc.data().planType;
      if (planType && planDistribution.hasOwnProperty(planType)) {
        planDistribution[planType]++;
      }
    });

    // Get recent campaigns (last 5)
    const recentCampaigns = campaignsSnap.docs
      .sort((a, b) => {
        const aTime = toDate(a.data().createdAt)?.getTime() || 0;
        const bTime = toDate(b.data().createdAt)?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, 5)
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: toDate(doc.data().createdAt)?.toISOString(),
        expiresAt: toDate(doc.data().expiresAt)?.toISOString(),
      }));

    // Get recent payments (last 10)
    const recentPayments = successfulPayments
      .sort((a, b) => {
        const aTime = toDate(a.data().createdAt)?.getTime() || 0;
        const bTime = toDate(b.data().createdAt)?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, 10)
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: toDate(doc.data().createdAt)?.toISOString(),
      }));

    // Get recent signups (last 10)
    const recentSignups = usersSnap.docs
      .sort((a, b) => {
        const aTime = toDate(a.data().createdAt)?.getTime() || 0;
        const bTime = toDate(b.data().createdAt)?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, 10)
      .map(doc => ({
        id: doc.id,
        email: doc.data().email,
        displayName: doc.data().displayName,
        createdAt: toDate(doc.data().createdAt)?.toISOString(),
      }));

    return NextResponse.json({
      stats: {
        totalUsers,
        usersToday,
        totalCampaigns,
        activeCampaigns,
        expiredCampaigns,
        freeCampaignsUsed,
        totalRevenue,
        totalRefunded,
        netRevenue,
        todayRevenue,
        last30DaysRevenue,
        totalRefunds: refundedPayments.length,
      },
      charts: {
        dailyRevenue,
        dailyNewUsers,
        planDistribution,
      },
      recent: {
        campaigns: recentCampaigns,
        payments: recentPayments,
        signups: recentSignups,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to fetch statistics',
        message: errorMessage,
        details: 'Check server logs for more information'
      },
      { status: 500 }
    );
  }
}
