import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  // Rate limit: 10 replies per 5 minutes per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
  if (!checkRateLimit(ip, { name: 'support-reply', limit: 10, windowMs: 5 * 60 * 1000 })) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const body = await request.json();
    const { ticketId, message } = body;

    if (!ticketId || !message?.trim()) {
      return NextResponse.json({ error: 'Ticket ID and message are required' }, { status: 400 });
    }

    if (message.trim().length > 5000) {
      return NextResponse.json({ error: 'Message must be 5000 characters or fewer' }, { status: 400 });
    }

    const ticketRef = adminDb.collection('support_tickets').doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticketData = ticketDoc.data();

    // Verify ownership by userId (primary) or email (fallback for legacy tickets)
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const userEmail = userDoc.data()?.email || decodedToken.email;
    const isOwner = ticketData?.userId === uid || ticketData?.email === userEmail;

    if (!isOwner) {
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
