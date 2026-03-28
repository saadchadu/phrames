import { adminAuth } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function verifyAdmin(request: NextRequest): Promise<{ uid: string; email: string } | NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const token = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.isAdmin !== true) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return { uid: decoded.uid, email: decoded.email || '' };
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function setAdminClaim(uid: string, isAdmin: boolean): Promise<void> {
  await adminAuth.setCustomUserClaims(uid, { isAdmin });
}
