import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  // Require admin auth — health data reveals internal config state
  const authHeader = (request as any).headers?.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1]);
    if (decoded.isAdmin !== true) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const hasProjectId = !!process.env.FIREBASE_PROJECT_ID;
    const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
    const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;

    let adminInitialized = false;
    let adminError = null;

    try {
      await adminDb.collection('settings').doc('system').get();
      adminInitialized = true;
    } catch (error: any) {
      adminError = 'Firestore connection failed';
    }

    return NextResponse.json({
      status: 'ok',
      firebase: { hasProjectId, hasClientEmail, hasPrivateKey, adminInitialized, adminError }
    });
  } catch {
    return NextResponse.json({ status: 'error', error: 'Health check failed' }, { status: 500 });
  }
}
