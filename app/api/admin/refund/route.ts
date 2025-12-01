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
      
      console.log('Refund API - User UID:', adminUid)
      console.log('Refund API - Expected Admin UID:', process.env.ADMIN_UID)
      
      // Check if user is admin
      if (adminUid !== process.env.ADMIN_UID) {
        console.error('Admin check failed:', {
          userUid: adminUid,
          expectedUid: process.env.ADMIN_UID,
          match: adminUid === process.env.ADMIN_UID
        })
        return NextResponse.json({ 
          error: 'Forbidden - Admin access required',
          debug: process.env.NODE_ENV === 'development' ? {
            yourUid: adminUid,
            expectedUid: process.env.ADMIN_UID
          } : undefined
        }, { status: 403 })
      }
    } catch (error) {
      console.error('Token verification error:', error)
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

    // Cashfree needs the order_id that was used when creating the payment
    // This is stored in the orderId field (format: order_timestamp_campaignId)
    const orderId = paymentData?.orderId

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID not found in payment record' }, { status: 400 })
    }

    // Calculate refund amount (default to full amount)
    const amountToRefund = refundAmount || paymentData?.amount

    // Determine the correct API URL based on environment
    const cashfreeApiUrl = process.env.CASHFREE_ENV === 'PRODUCTION' 
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders'

    // Call Cashfree Refund API
    const cashfreeResponse = await fetch(`${cashfreeApiUrl}/${orderId}/refunds`, {
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
    return NextResponse.json({ 
      error: 'Failed to process refund',
      details: error.message 
    }, { status: 500 })
  }
}
