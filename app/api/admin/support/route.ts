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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Build query — apply where() before orderBy() to avoid composite index requirement
    let query: any = adminDb.collection('support_tickets');

    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.limit(100).get();
    const tickets = snapshot.docs
      .map((doc: any) => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error('Error fetching tickets:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    // Get user email for notes
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    const body = await request.json();
    const { ticketId, status, note } = body;

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
    }

    const ticketRef = adminDb.collection('support_tickets').doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
    }

    if (note) {
      const ticketData = ticketDoc.data();
      const notes = ticketData?.notes || [];
      const isFirstReply = notes.length === 0;
      notes.push({
        text: note,
        addedBy: userData?.email || 'admin',
        addedAt: new Date().toISOString(),
        sender: 'admin',
      });
      updateData.notes = notes;
      updateData.needsAdminReply = false; // admin has responded, clear the badge

      // Send confirmation email to user on first reply
      if (isFirstReply && ticketData?.email) {
        import('@/lib/email').then(({ sendSupportTicketEmail }) =>
          sendSupportTicketEmail(ticketData.email, {
            name: ticketData.name,
            ticketId: ticketData.ticketId,
            subject: ticketData.subject,
          })
        ).catch((err) => {
          console.error('[email] Support ticket user email failed:', err);
        });
      }
    }

    await ticketRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const { ticketId } = body;

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
    }

    const ticketRef = adminDb.collection('support_tickets').doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Delete the ticket
    await ticketRef.delete();

    return NextResponse.json({ 
      success: true,
      message: 'Ticket deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
