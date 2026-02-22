import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET() {
    try {
        const snapshot = await adminDb.collection('coupons').orderBy('createdAt', 'desc').get();
        const coupons = snapshot.docs.map((doc) => ({
            ...doc.data(),
            code: doc.id, // using document ID as code
            validFrom: doc.data().validFrom?.toDate().toISOString() || null,
            validUntil: doc.data().validUntil?.toDate().toISOString() || null,
            createdAt: doc.data().createdAt?.toDate().toISOString() || null,
        }));
        return NextResponse.json({ success: true, coupons });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        let {
            code,
            type,
            value,
            applicablePlans,
            minAmount,
            usageLimit,
            perUserLimit,
            validFrom,
            validUntil,
            isActive,
            createdBy,
        } = body;

        code = code.toUpperCase().trim();
        if (!code || !type || value === undefined) {
            return NextResponse.json({ success: false, error: 'Missing required code, type or value' }, { status: 400 });
        }

        const docRef = adminDb.collection('coupons').doc(code);
        const snap = await docRef.get();
        if (snap.exists) {
            return NextResponse.json({ success: false, error: 'Coupon code already exists' }, { status: 400 });
        }

        const newCoupon = {
            type,
            value: Number(value),
            applicablePlans: applicablePlans || [],
            minAmount: minAmount ? Number(minAmount) : 0,
            usageLimit: usageLimit ? Number(usageLimit) : 0, // 0 = unlimited
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
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
