import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params; // This is the coupon code
        const body = await req.json();
        const docRef = adminDb.collection('coupons').doc(id);
        const snap = await docRef.get();

        if (!snap.exists) {
            return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
        }

        const updateData: any = {};
        if (body.isActive !== undefined) updateData.isActive = body.isActive;
        if (body.type !== undefined) updateData.type = body.type;
        if (body.value !== undefined) updateData.value = Number(body.value);
        if (body.applicablePlans !== undefined) updateData.applicablePlans = body.applicablePlans;
        if (body.usageLimit !== undefined) updateData.usageLimit = Number(body.usageLimit);

        // Handle dates accurately mapping Firestore Timestamps
        const { Timestamp } = require('firebase-admin/firestore');
        if (body.validFrom !== undefined) {
            updateData.validFrom = body.validFrom ? Timestamp.fromDate(new Date(body.validFrom)) : null;
        }
        if (body.validUntil !== undefined) {
            updateData.validUntil = body.validUntil ? Timestamp.fromDate(new Date(body.validUntil)) : null;
        }

        await docRef.update(updateData);

        return NextResponse.json({ success: true, message: 'Coupon updated successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const docRef = adminDb.collection('coupons').doc(id);
        await docRef.delete();
        return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
