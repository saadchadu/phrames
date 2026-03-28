import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

async function verifyAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.split('Bearer ')[1]);
    return decoded.isAdmin === true ? decoded : null;
  } catch { return null; }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const docRef = adminDb.collection('coupons').doc(id);
    if (!(await docRef.get()).exists) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.value !== undefined) updateData.value = Number(body.value);
    if (body.applicablePlans !== undefined) updateData.applicablePlans = body.applicablePlans;
    if (body.usageLimit !== undefined) updateData.usageLimit = Number(body.usageLimit);

    const { Timestamp } = await import('firebase-admin/firestore');
    if (body.validFrom !== undefined) updateData.validFrom = body.validFrom ? Timestamp.fromDate(new Date(body.validFrom)) : null;
    if (body.validUntil !== undefined) updateData.validUntil = body.validUntil ? Timestamp.fromDate(new Date(body.validUntil)) : null;

    await docRef.update(updateData);
    return NextResponse.json({ success: true, message: 'Coupon updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    await adminDb.collection('coupons').doc(id).delete();
    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
