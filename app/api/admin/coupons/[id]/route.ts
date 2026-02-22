import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params; // This is the coupon code
        const body = await req.json();
        const { isActive } = body;

        const docRef = adminDb.collection('coupons').doc(id);
        const snap = await docRef.get();

        if (!snap.exists) {
            return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
        }

        await docRef.update({ isActive });

        return NextResponse.json({ success: true, message: 'Coupon updated successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const docRef = adminDb.collection('coupons').doc(id);
        await docRef.delete();
        return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
