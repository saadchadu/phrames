import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

export async function POST(request: NextRequest) {
  try {
    // Get authorization token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    
    // Verify Firebase token and check if admin
    let adminUid: string
    try {
      const decodedToken = await getAuth().verifyIdToken(token)
      adminUid = decodedToken.uid
      
      // Check if user is admin
      if (adminUid !== process.env.ADMIN_UID) {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentId, refundAmount, refundNote } = body

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    // Get payment record
    const paymentRef = db.collection('payments').doc(paymentId)
    const paymentDoc = await paymentRef.get()

    if (!paymentDoc.exists) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const paymentData = paymentDoc.data()

    // Check if already refunded
    if (paymentData?.status === 'refunded') {
      return NextResponse.json({ error: 'Payment already refunded' }, { status: 400 })
    }

    // Check if payment was successful
    if (paymentData?.status !== 'success' && paymentData?.status !== 'SUCCESS') {
      return NextResponse.json({ error: 'Can only refund successful payments' }, { status: 400 })
    }

    const orderId = paymentData?.cashfreeOrderId || paymentData?.orderId

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID not found in payment record' }, { status: 400 })
    }

    // Calculate refund amount (default to full amount)
    const amountToRefund = refundAmount || paymentData?.amount

    // Call Cashfree Refund API
    const cashfreeResponse = await fetch(`https://api.cashfree.com/pg/orders/${orderId}/refunds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_CLIENT_ID!,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
        'x-api-version': '2023-08-01'
      },
      body: JSON.stringify({
        refund_amount: amountToRefund,
        refund_note: refundNote || 'Refund processed by admin'
      })
    })

    const refundData = await cashfreeResponse.json()

    if (!cashfreeResponse.ok) {
      console.error('Cashfree refund failed:', refundData)
      return NextResponse.json({ 
        error: refundData.message || 'Failed to process refund with Cashfree',
        details: refundData
      }, { status: 400 })
    }

    // Update payment record
    await paymentRef.update({
      status: 'refunded',
      refundedAt: Timestamp.now(),
      refundAmount: amountToRefund,
      refundNote: refundNote || 'Refund processed by admin',
      refundId: refundData.cf_refund_id,
      refundData: refundData,
      refundedBy: adminUid
    })

    // Deactivate campaign
    if (paymentData?.campaignId) {
      const campaignRef = db.collection('campaigns').doc(paymentData.campaignId)
      await campaignRef.update({
        isActive: false,
        status: 'Refunded',
        refundedAt: Timestamp.now()
      })
    }

    // Create admin log
    await db.collection('logs').add({
      eventType: 'payment_refunded',
      actorId: adminUid,
      description: `Refund processed for payment ${paymentId}`,
      metadata: {
        paymentId,
        orderId,
        campaignId: paymentData?.campaignId,
        userId: paymentData?.userId,
        refundAmount: amountToRefund,
        refundNote: refundNote || 'Refund processed by admin',
        refundId: refundData.cf_refund_id
      },
      createdAt: Timestamp.now()
    })

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
      refundId: refundData.cf_refund_id,
      refundAmount: amountToRefund
    })

  } catch (error: any) {
    console.error('Refund processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process refund',
      details: error.message 
    }, { status: 500 })
  }
}
