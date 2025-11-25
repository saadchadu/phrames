import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

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
    
    await docRef.set({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
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
