import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const db = adminDb;

// Helper to safely convert Firestore timestamp to Date
function toDate(timestamp: any): Date | null {
  if (!timestamp) return null;
  
  // If it's already a Date
  if (timestamp instanceof Date) return timestamp;
  
  // If it's a Firestore Timestamp with toDate method
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // If it's a timestamp object with seconds
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  
  // If it's a string, try to parse it
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // If it's a number (milliseconds)
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  return null;
}

export async function GET() {
  try {
    // Note: Admin verification is handled by client-side checks in AdminLayoutClient
    // For production, consider adding server-side verification here
    
    // Get current date info
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

    // Calculate revenue stats
    const successfulPayments = paymentsSnap.docs.filter(doc => {
      const data = doc.data();
      return data.status === 'SUCCESS' || data.status === 'success';
    });

    const totalRevenue = successfulPayments.reduce((sum, doc) => {
      return sum + (doc.data().amount || 0);
    }, 0);

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
        todayRevenue,
        last30DaysRevenue,
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
