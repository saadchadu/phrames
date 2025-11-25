import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const hasProjectId = !!process.env.FIREBASE_PROJECT_ID;
    const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
    const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;
    
    // Try to import firebase-admin
    let adminInitialized = false;
    let adminError = null;
    
    try {
      const { adminDb } = await import('@/lib/firebase-admin');
      adminInitialized = true;
      
      // Try a simple Firestore operation
      await adminDb.collection('settings').doc('system').get();
    } catch (error: any) {
      adminError = error.message;
    }
    
    return NextResponse.json({
      status: 'ok',
      environment: process.env.NODE_ENV,
      firebase: {
        hasProjectId,
        hasClientEmail,
        hasPrivateKey,
        adminInitialized,
        adminError
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
