import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

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

    // Generate ticket ID
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create ticket document
    const ticketData = {
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

    await adminDb.collection('support_tickets').doc(ticketId).set(ticketData);

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
