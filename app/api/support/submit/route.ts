import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, category, subject, message, orderId, campaignId } = body;

    // Validate required fields
    if (!name || !email || !category || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Enforce length limits to prevent abuse
    if (name.length > 100) {
      return NextResponse.json({ error: 'Name must be 100 characters or fewer' }, { status: 400 })
    }
    if (subject.length > 200) {
      return NextResponse.json({ error: 'Subject must be 200 characters or fewer' }, { status: 400 })
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message must be 5000 characters or fewer' }, { status: 400 })
    }

    const allowedCategories = ['general', 'billing', 'technical', 'account', 'other']
    if (!allowedCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Try to get userId from auth token if provided (optional)
    let userId: string | null = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split('Bearer ')[1];
        const decoded = await adminAuth.verifyIdToken(token);
        userId = decoded.uid;
      } catch {
        // Not authenticated — that's fine, tickets are public
      }
    }

    // Generate ticket ID
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create ticket document
    const ticketData: any = {
      ticketId,
      name,
      email,
      category,
      subject,
      message,
      orderId: orderId || null,
      campaignId: campaignId || null,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [],
    };

    if (userId) {
      ticketData.userId = userId;
    }

    await adminDb.collection('support_tickets').doc(ticketId).set(ticketData);

    // Notify support team (non-blocking)
    import('@/lib/email').then(({ sendSupportTeamNotificationEmail }) =>
      sendSupportTeamNotificationEmail({ name, email, ticketId, subject, category, message })
    ).catch((err) => {
      console.error('[email] Support team notification email failed:', err)
    })

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Ticket submitted successfully',
    });
  } catch (error: any) {
    console.error('Error submitting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to submit ticket' },
      { status: 500 }
    );
  }
}
