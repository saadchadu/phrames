import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { ticketId } = body;

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
    }

    // Get the ticket
    const ticketRef = adminDb.collection('support_tickets').doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticketData = ticketDoc.data();

    // Verify the ticket belongs to this user
    if (ticketData?.email !== userEmail) {
      return NextResponse.json({ error: 'Unauthorized to cancel this ticket' }, { status: 403 });
    }

    // Only allow canceling open or in_progress tickets
    if (ticketData?.status === 'resolved' || ticketData?.status === 'closed') {
      return NextResponse.json({ 
        error: 'Cannot cancel a ticket that is already resolved or closed' 
      }, { status: 400 });
    }

    // Update ticket status to closed
    await ticketRef.update({
      status: 'closed',
      updatedAt: new Date().toISOString(),
      cancelledBy: 'user',
      cancelledAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true,
      message: 'Ticket cancelled successfully' 
    });
  } catch (error: any) {
    console.error('Error cancelling ticket:', error);
    return NextResponse.json(
      { error: 'Failed to cancel ticket' },
      { status: 500 }
    );
  }
}
