import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

const ADMIN_EMAILS = ['saadchadu@gmail.com']

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Verify the token and check the target user's email
    await adminAuth.verifyIdToken(idToken);

    // Only allow granting admin to pre-approved emails
    const targetUser = await adminAuth.getUser(userId);
    if (!targetUser.email || !ADMIN_EMAILS.includes(targetUser.email.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await adminAuth.setCustomUserClaims(userId, { isAdmin: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error granting admin access:', error);
    return NextResponse.json(
      { error: 'Failed to grant admin access' },
      { status: 500 }
    );
  }
}
