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

    // Count tickets that need an admin reply (new tickets or user replied)
    const snapshot = await adminDb
      .collection('support_tickets')
      .where('needsAdminReply', '==', true)
      .get();

    return NextResponse.json({ 
      success: true,
      count: snapshot.size,
    });
  } catch (error: any) {
    console.error('Error counting tickets:', error);
    return NextResponse.json({ error: 'Failed to count tickets' }, { status: 500 });
  }
}
