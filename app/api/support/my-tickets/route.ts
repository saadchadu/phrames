import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Get user's email
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    const userEmail = userData?.email || decodedToken.email;

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Query by userId (for tickets submitted while logged in) AND by email (for older/public tickets)
    const [byUserId, byEmail] = await Promise.all([
      adminDb.collection('support_tickets')
        .where('userId', '==', decodedToken.uid)
        .limit(50)
        .get(),
      adminDb.collection('support_tickets')
        .where('email', '==', userEmail)
        .limit(50)
        .get(),
    ]);

    // Merge and deduplicate by doc ID
    const seen = new Set<string>();
    const tickets: any[] = [];

    for (const doc of [...byUserId.docs, ...byEmail.docs]) {
      if (!seen.has(doc.id)) {
        seen.add(doc.id);
        tickets.push({ id: doc.id, ...doc.data() });
      }
    }

    // Sort newest first
    tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error('Error fetching user tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}
