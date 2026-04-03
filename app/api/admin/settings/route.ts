import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

const db = adminDb;

async function verifyAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.split('Bearer ')[1]);
    return decoded.isAdmin === true ? decoded : null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const [systemDoc, plansDoc] = await Promise.all([
      db.collection('settings').doc('system').get(),
      db.collection('settings').doc('plans').get(),
    ]);
    return NextResponse.json({
      system: systemDoc.exists ? systemDoc.data() : null,
      plans: plansDoc.exists ? plansDoc.data() : null,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (!type) return NextResponse.json({ error: 'Missing type' }, { status: 400 });

    // Whitelist allowed settings documents to prevent arbitrary Firestore writes
    const allowedTypes = ['system', 'plans'];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid settings type' }, { status: 400 });
    }

    const { FieldValue } = await import('firebase-admin/firestore');
    await db.collection('settings').doc(type).set({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: admin.uid,
    }, { merge: true });

    await db.collection('logs').add({
      eventType: 'settings_changed',
      actorId: admin.uid,
      description: `${type} settings changed`,
      metadata: { settingType: type, changes: data },
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
