import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if user has admin claim
    if (decodedToken.isAdmin !== true) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Count open tickets
    const openSnapshot = await adminDb
      .collection('support_tickets')
      .where('status', '==', 'open')
      .get();

    // Count in-progress tickets
    const inProgressSnapshot = await adminDb
      .collection('support_tickets')
      .where('status', '==', 'in_progress')
      .get();

    const totalPending = openSnapshot.size + inProgressSnapshot.size;

    return NextResponse.json({ 
      success: true,
      count: totalPending,
      breakdown: {
        open: openSnapshot.size,
        inProgress: inProgressSnapshot.size
      }
    });
  } catch (error: any) {
    console.error('Error counting tickets:', error);
    return NextResponse.json({ error: 'Failed to count tickets' }, { status: 500 });
  }
}
