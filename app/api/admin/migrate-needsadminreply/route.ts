import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// One-time migration: set needsAdminReply on existing tickets
// - open/in_progress tickets with no admin reply → true
// - open/in_progress tickets where last note is from admin → false
// - resolved/closed tickets → false
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (decodedToken.isAdmin !== true) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const snapshot = await adminDb.collection('support_tickets').get();
    const batch = adminDb.batch();
    let updated = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      // Skip tickets that already have the field
      if (typeof data.needsAdminReply === 'boolean') return;

      const isActive = data.status === 'open' || data.status === 'in_progress';
      const notes: any[] = data.notes || [];
      const lastNote = notes[notes.length - 1];
      const lastSenderIsAdmin = lastNote?.sender === 'admin';

      // Needs reply if active and no admin has replied yet (or last message is from user)
      const needsAdminReply = isActive && !lastSenderIsAdmin;

      batch.update(doc.ref, { needsAdminReply });
      updated++;
    });

    await batch.commit();

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
