import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { Query } from 'firebase-admin/firestore';

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
    const status = searchParams.get('status');
    const planType = searchParams.get('planType');
    const timeRange = searchParams.get('timeRange');
    const searchQuery = searchParams.get('search');

    let query: Query = db.collection('payments');

    // Apply status filter
    if (status) {
      query = query.where('status', '==', status.toUpperCase());
    }

    // Apply plan type filter
    if (planType) {
      query = query.where('planType', '==', planType);
    }

    // Apply time range filter
    if (timeRange) {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      query = query.where('createdAt', '>=', Timestamp.fromDate(startDate));
    }

    // Order by creation date (most recent first)
    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    
    let payments = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: toDate(data.createdAt)?.toISOString(),
      };
    });

    // Apply search filter if provided (client-side filtering)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      payments = payments.filter(payment => {
        const p = payment as any;
        return (
          p.id?.toLowerCase().includes(searchLower) ||
          p.userId?.toLowerCase().includes(searchLower) ||
          p.campaignId?.toLowerCase().includes(searchLower) ||
          p.orderId?.toLowerCase().includes(searchLower) ||
          p.cashfreeOrderId?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Calculate analytics
    const successfulPayments = payments.filter(p => {
      const data = p as any;
      return data.status === 'SUCCESS' || data.status === 'success';
    });

    const totalRevenue = successfulPayments.reduce((sum, p) => {
      const data = p as any;
      return sum + (data.amount || 0);
    }, 0);

    // Revenue by plan type
    const revenueByPlan: { [key: string]: number } = {};
    successfulPayments.forEach(payment => {
      const data = payment as any;
      const plan = data.planType || 'unknown';
      revenueByPlan[plan] = (revenueByPlan[plan] || 0) + (data.amount || 0);
    });

    // Daily revenue for last 30 days
    const now = new Date();
    const dailyRevenue: { date: string; revenue: number }[] = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayRevenue = successfulPayments
        .filter(p => {
          const data = p as any;
          const createdAt = new Date(data.createdAt);
          return createdAt >= dayStart && createdAt < dayEnd;
        })
        .reduce((sum, p) => {
          const data = p as any;
          return sum + (data.amount || 0);
        }, 0);

      dailyRevenue.push({ date: dateStr, revenue: dayRevenue });
    }

    return NextResponse.json({
      payments,
      analytics: {
        totalRevenue,
        totalPayments: payments.length,
        successfulPayments: successfulPayments.length,
        failedPayments: payments.length - successfulPayments.length,
        revenueByPlan,
        dailyRevenue,
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
