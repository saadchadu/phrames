import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

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
    const eventType = searchParams.get('eventType');
    const dateRange = searchParams.get('dateRange');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query: admin.firestore.Query = db.collection('logs');

    if (eventType) {
      query = query.where('eventType', '==', eventType);
    }

    // Add date range filtering
    if (dateRange) {
      const now = new Date();

      switch (dateRange) {
        case 'today':
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          query = query.where('createdAt', '>=', admin.firestore.Timestamp.fromDate(todayStart));
          break;
        case 'yesterday':
          const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          query = query.where('createdAt', '>=', admin.firestore.Timestamp.fromDate(yesterdayStart));
          query = query.where('createdAt', '<', admin.firestore.Timestamp.fromDate(yesterdayEnd));
          break;
        case 'last7days':
          const last7Start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          query = query.where('createdAt', '>=', admin.firestore.Timestamp.fromDate(last7Start));
          break;
        case 'last30days':
          const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          query = query.where('createdAt', '>=', admin.firestore.Timestamp.fromDate(last30Start));
          break;
        case 'last90days':
          const last90Start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          query = query.where('createdAt', '>=', admin.firestore.Timestamp.fromDate(last90Start));
          break;
        default:
          // No date filter
          break;
      }
    }

    query = query.orderBy('createdAt', 'desc').limit(limit);

    const snapshot = await query.get();
    
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt)?.toISOString(),
    }));

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
