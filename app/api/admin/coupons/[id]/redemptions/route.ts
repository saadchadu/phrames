import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        // Fetch all redemptions under this coupon code
        const snapshot = await adminDb
            .collection('coupons')
            .doc(id)
            .collection('redemptions')
            .orderBy('redeemedAt', 'desc')
            .get();

        if (snapshot.empty) {
            return NextResponse.json({ success: true, redemptions: [] });
        }

        const redemptions = await Promise.all(snapshot.docs.map(async (doc) => {
            const data = doc.data();

            // Optionally fetch user data securely
            let userEmail = 'Unknown';
            try {
                const userDoc = await adminDb.collection('users').doc(data.userId).get();
                if (userDoc.exists) {
                    userEmail = userDoc.data()?.email || 'Unknown';
                }
            } catch (err) {
                console.error("Error fetching user email for redemption", err);
            }

            return {
                id: doc.id,
                userId: data.userId,
                userEmail, // Added email for context rendering
                campaignId: data.campaignId,
                paymentId: data.paymentId,
                discountApplied: data.discountApplied,
                count: data.count,
                payments: data.payments || [],
                redeemedAt: data.redeemedAt?.toDate().toISOString() || null,
                lastRedeemedAt: data.lastRedeemedAt?.toDate().toISOString() || null,
            };
        }));

        return NextResponse.json({ success: true, redemptions });
    } catch (error: any) {
        console.error("Error fetching redemptions:", error);
        return NextResponse.json({ success: false, error: 'Failed to fetch redemptions' }, { status: 500 });
    }
}
