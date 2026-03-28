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

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await context.params;
    const snapshot = await adminDb.collection('coupons').doc(id).collection('redemptions').orderBy('redeemedAt', 'desc').get();

    if (snapshot.empty) return NextResponse.json({ success: true, redemptions: [] });

    const redemptions = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      let userEmail = 'Unknown';
      try {
        const userDoc = await adminDb.collection('users').doc(data.userId).get();
        if (userDoc.exists) userEmail = userDoc.data()?.email || 'Unknown';
      } catch { /* non-critical */ }

      return {
        id: doc.id,
        userId: data.userId,
        userEmail,
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
    return NextResponse.json({ success: false, error: 'Failed to fetch redemptions' }, { status: 500 });
  }
}
