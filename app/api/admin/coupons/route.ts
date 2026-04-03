import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

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
    const snapshot = await adminDb.collection('coupons').orderBy('createdAt', 'desc').get();
    const coupons = snapshot.docs.map((doc) => ({
      ...doc.data(),
      code: doc.id,
      validFrom: doc.data().validFrom?.toDate().toISOString() || null,
      validUntil: doc.data().validUntil?.toDate().toISOString() || null,
      createdAt: doc.data().createdAt?.toDate().toISOString() || null,
    }));
    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    let { code, type, value, applicablePlans, minAmount, usageLimit, perUserLimit, validFrom, validUntil, isActive, createdBy } = body;

    code = (code || '').toUpperCase().trim();
    if (!code || !type || value === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required code, type or value' }, { status: 400 });
    }

    const docRef = adminDb.collection('coupons').doc(code);
    if ((await docRef.get()).exists) {
      return NextResponse.json({ success: false, error: 'Coupon code already exists' }, { status: 400 });
    }

    const newCoupon = {
      type,
      value: Number(value),
      applicablePlans: applicablePlans || [],
      minAmount: minAmount ? Number(minAmount) : 0,
      usageLimit: usageLimit ? Number(usageLimit) : 0,
      usedCount: 0,
      perUserLimit: perUserLimit ? Number(perUserLimit) : 0,
      validFrom: validFrom ? Timestamp.fromDate(new Date(validFrom)) : null,
      validUntil: validUntil ? Timestamp.fromDate(new Date(validUntil)) : null,
      isActive: isActive ?? true,
      createdBy: createdBy || 'admin',
      createdAt: Timestamp.now(),
    };

    await docRef.set(newCoupon);
    return NextResponse.json({ success: true, coupon: { id: code, ...newCoupon } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to create coupon' }, { status: 500 });
  }
}
