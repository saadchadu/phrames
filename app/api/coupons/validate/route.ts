import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import type { DocumentData } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ valid: false, message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await getAuth().verifyIdToken(token);
        const userId = decodedToken.uid;

        const { code, plan, amount } = await request.json();

        if (!code || !plan || amount === undefined) {
            return NextResponse.json({ valid: false, message: 'Missing required fields' }, { status: 400 });
        }

        const couponCode = code.toUpperCase().trim();
        const couponRef = adminDb.collection('coupons').doc(couponCode);
        const couponSnap = await couponRef.get();

        if (!couponSnap.exists) {
            return NextResponse.json({ valid: false, message: 'Invalid coupon code' }, { status: 200 }); // Status 200 for graceful client handling
        }

        const coupon = couponSnap.data() as DocumentData;

        // Validation checks
        if (!coupon.isActive) {
            return NextResponse.json({ valid: false, message: 'Coupon is not active' }, { status: 200 });
        }

        const now = new Date();
        if (coupon.validFrom) {
            const fromDate = typeof coupon.validFrom.toDate === 'function' ? coupon.validFrom.toDate() : new Date(coupon.validFrom);
            // Allow for global timezone span (starts at earliest timezone UTC+14)
            fromDate.setUTCHours(0, 0, 0, 0);
            fromDate.setHours(fromDate.getHours() - 14);
            if (fromDate > now) {
                return NextResponse.json({ valid: false, message: 'Coupon is not yet valid' }, { status: 200 });
            }
        }

        if (coupon.validUntil) {
            const untilDate = typeof coupon.validUntil.toDate === 'function' ? coupon.validUntil.toDate() : new Date(coupon.validUntil);
            // Allow for global timezone span (expires at latest timezone UTC-14)
            untilDate.setUTCHours(23, 59, 59, 999);
            untilDate.setHours(untilDate.getHours() + 14);
            if (untilDate < now) {
                return NextResponse.json({ valid: false, message: 'Coupon has expired' }, { status: 200 });
            }
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json({ valid: false, message: 'Coupon usage limit reached' }, { status: 200 });
        }

        if (coupon.applicablePlans && coupon.applicablePlans.length > 0 && !coupon.applicablePlans.includes(plan)) {
            return NextResponse.json({ valid: false, message: 'Coupon not applicable for this plan' }, { status: 200 });
        }

        if (coupon.minAmount && amount < coupon.minAmount) {
            return NextResponse.json({ valid: false, message: `Minimum order amount is ₹${coupon.minAmount}` }, { status: 200 });
        }

        // Check per-user limit
        if (coupon.perUserLimit) {
            const redemptionRef = couponRef.collection('redemptions').doc(userId);
            const redemptionSnap = await redemptionRef.get();
            if (redemptionSnap.exists) {
                // Here we could count how many they have, but for simplicity assuming 1 doc per user tracking total usages, or just existence means used 1 time limit
                // Since we want multiple uses limit possibly: let's track a counter in standard redemptions or the document.
                // For simple "perUserLimit", if the doc exists and count >= perUserLimit, block it.
                const userRedemption = redemptionSnap.data();
                if (userRedemption && userRedemption.count >= coupon.perUserLimit) {
                    return NextResponse.json({ valid: false, message: 'You have reached the maximum usage limit for this coupon' }, { status: 200 });
                }
            }
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.type === 'flat') {
            discountAmount = Math.min(coupon.value, amount); // Can't be more than amount
        } else if (coupon.type === 'percent') {
            discountAmount = Math.round((amount * coupon.value) / 100);
            discountAmount = Math.min(discountAmount, amount); // Safety
        }

        if (discountAmount <= 0) {
            return NextResponse.json({ valid: false, message: 'Coupon provides no discount' }, { status: 200 });
        }

        const finalAmount = amount - discountAmount;

        return NextResponse.json({
            valid: true,
            discountAmount,
            finalAmount,
            code: couponCode
        });

    } catch (error: any) {
        console.error('Coupon validation error:', error);
        return NextResponse.json({ valid: false, message: 'Failed to validate coupon' }, { status: 500 });
    }
}
