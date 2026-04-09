import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  // Rate limit: 5 support tickets per 15 minutes per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
  if (!checkRateLimit(ip, { name: 'support-submit', limit: 5, windowMs: 15 * 60 * 1000 })) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

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

    // Strip control characters to prevent injection
    const sanitize = (s: string) => s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()
    const safeName = sanitize(name)
    const safeSubject = sanitize(subject)
    const safeMessage = sanitize(message)
    const safeOrderId = orderId ? sanitize(String(orderId)) : null
    const safeCampaignId = campaignId ? sanitize(String(campaignId)) : null

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Enforce length limits to prevent abuse
    if (safeName.length > 100) {
      return NextResponse.json({ error: 'Name must be 100 characters or fewer' }, { status: 400 })
    }
    if (safeSubject.length > 200) {
      return NextResponse.json({ error: 'Subject must be 200 characters or fewer' }, { status: 400 })
    }
    if (safeMessage.length > 5000) {
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
      name: safeName,
      email,
      category,
      subject: safeSubject,
      message: safeMessage,
      orderId: safeOrderId,
      campaignId: safeCampaignId,
      status: 'open',
      needsAdminReply: true,
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
      sendSupportTeamNotificationEmail({ name: safeName, email, ticketId, subject: safeSubject, category, message: safeMessage })
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
