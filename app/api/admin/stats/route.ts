import { NextRequest, NextResponse } from 'next/server';
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

// Exported for direct server-side use (e.g. admin overview page)
export async function getAdminStatsData() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [usersSnap, campaignsSnap, paymentsSnap] = await Promise.all([
    db.collection('users').get(),
    db.collection('campaigns').get(),
    db.collection('payments').get(),
  ]);

  const totalUsers = usersSnap.size;
  const usersToday = usersSnap.docs.filter(doc => {
    const createdAt = toDate(doc.data().createdAt);
    return createdAt && createdAt >= todayStart;
  }).length;

  const totalCampaigns = campaignsSnap.size;
  const activeCampaigns = campaignsSnap.docs.filter(doc => doc.data().isActive === true).length;
  const expiredCampaigns = campaignsSnap.docs.filter(doc => {
    const expiresAt = toDate(doc.data().expiresAt);
    return expiresAt && expiresAt < now;
  }).length;
  const freeCampaignsUsed = campaignsSnap.docs.filter(doc => doc.data().isFreeCampaign === true).length;

  const isSuccessful = (data: any) =>
    (data.status === 'SUCCESS' || data.status === 'success') && data.status !== 'refunded';
  const isRefunded = (data: any) => data.status === 'refunded';

  const successfulPayments = paymentsSnap.docs.filter(doc => isSuccessful(doc.data()));
  const refundedPayments = paymentsSnap.docs.filter(doc => isRefunded(doc.data()));

  const totalRevenue = successfulPayments.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
  const totalRefunded = refundedPayments.reduce((sum, doc) => sum + (doc.data().refundAmount || doc.data().amount || 0), 0);
  const netRevenue = Math.max(0, totalRevenue - totalRefunded);

  const todayRevenue = successfulPayments
    .filter(doc => { const c = toDate(doc.data().createdAt); return c && c >= todayStart; })
    .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

  const last30DaysRevenue = successfulPayments
    .filter(doc => { const c = toDate(doc.data().createdAt); return c && c >= thirtyDaysAgo; })
    .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

  const dailyRevenue: { date: string; revenue: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const dayRevenue = successfulPayments
      .filter(doc => { const c = toDate(doc.data().createdAt); return c && c >= dayStart && c < dayEnd; })
      .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
    dailyRevenue.push({ date: dateStr, revenue: dayRevenue });
  }

  const dailyNewUsers: { date: string; users: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const dayUsers = usersSnap.docs.filter(doc => {
      const c = toDate(doc.data().createdAt);
      return c && c >= dayStart && c < dayEnd;
    }).length;
    dailyNewUsers.push({ date: dateStr, users: dayUsers });
  }

  const planDistribution: { [key: string]: number } = { week: 0, month: 0, '3month': 0, '6month': 0, year: 0 };
  successfulPayments.forEach(doc => {
    const planType = doc.data().planType;
    if (planType && planDistribution.hasOwnProperty(planType)) planDistribution[planType]++;
  });

  const recentCampaigns = campaignsSnap.docs
    .sort((a, b) => (toDate(b.data().createdAt)?.getTime() || 0) - (toDate(a.data().createdAt)?.getTime() || 0))
    .slice(0, 5)
    .map(doc => ({ id: doc.id, ...doc.data(), createdAt: toDate(doc.data().createdAt)?.toISOString() ?? new Date(0).toISOString(), expiresAt: toDate(doc.data().expiresAt)?.toISOString() }));

  const recentPayments = successfulPayments
    .sort((a, b) => (toDate(b.data().createdAt)?.getTime() || 0) - (toDate(a.data().createdAt)?.getTime() || 0))
    .slice(0, 10)
    .map(doc => ({ id: doc.id, ...doc.data(), createdAt: toDate(doc.data().createdAt)?.toISOString() }));

  const recentSignups = usersSnap.docs
    .sort((a, b) => (toDate(b.data().createdAt)?.getTime() || 0) - (toDate(a.data().createdAt)?.getTime() || 0))
    .slice(0, 10)
    .map(doc => ({ id: doc.id, email: doc.data().email, displayName: doc.data().displayName, createdAt: toDate(doc.data().createdAt)?.toISOString() }));

  return {
    stats: { totalUsers, usersToday, totalCampaigns, activeCampaigns, expiredCampaigns, freeCampaignsUsed, totalRevenue, totalRefunded, netRevenue, todayRevenue, last30DaysRevenue, totalRefunds: refundedPayments.length },
    charts: { dailyRevenue, dailyNewUsers, planDistribution },
    recent: { campaigns: recentCampaigns, payments: recentPayments, signups: recentSignups },
  };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1]);
    if (decoded.isAdmin !== true) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await getAdminStatsData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
