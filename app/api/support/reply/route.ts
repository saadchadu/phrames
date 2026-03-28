import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    const userEmail = userData?.email || decodedToken.email;

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const body = await request.json();
    const { ticketId, message } = body;

    if (!ticketId || !message?.trim()) {
      return NextResponse.json({ error: 'Ticket ID and message are required' }, { status: 400 });
    }

    const ticketRef = adminDb.collection('support_tickets').doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticketData = ticketDoc.data();

    if (ticketData?.email !== userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (ticketData?.status === 'resolved' || ticketData?.status === 'closed') {
      return NextResponse.json({ error: 'Cannot reply to a closed or resolved ticket' }, { status: 400 });
    }

    const notes = ticketData?.notes || [];
    notes.push({
      text: message.trim(),
      addedBy: ticketData?.name || userEmail,
      addedAt: new Date().toISOString(),
      sender: 'user',
    });

    await ticketRef.update({
      notes,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error adding user reply:', error);
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
  }
}
