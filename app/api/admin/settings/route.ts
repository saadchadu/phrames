import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const db = adminDb;

export async function GET() {
  try {
    const [systemDoc, plansDoc] = await Promise.all([
      db.collection('settings').doc('system').get(),
      db.collection('settings').doc('plans').get(),
    ]);

    return NextResponse.json({
      system: systemDoc.exists ? systemDoc.data() : null,
      plans: plansDoc.exists ? plansDoc.data() : null,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, adminId, ...data } = body;

    if (!type || !adminId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const docRef = db.collection('settings').doc(type);
    
    const { FieldValue } = await import('firebase-admin/firestore');
    
    await docRef.set({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: adminId,
    }, { merge: true });

    // Log the settings change
    await db.collection('logs').add({
      eventType: 'settings_changed',
      actorId: adminId,
      description: `${type} settings changed`,
      metadata: {
        settingType: type,
        changes: data,
      },
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
