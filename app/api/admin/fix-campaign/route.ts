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

// Plan duration mapping
const PLAN_DURATIONS: { [key: string]: number } = {
  'week': 7,
  'month': 30,
  '3month': 90,
  '6month': 180,
  'year': 365
}

function calculateExpiryDate(planType: string): Date | null {
  const days = PLAN_DURATIONS[planType]
  if (!days) return null
  
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + days)
  return expiryDate
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    
    // Verify Firebase token and check if admin
    let userId: string
    try {
      const decodedToken = await getAuth().verifyIdToken(token)
      userId = decodedToken.uid
      
      // Check if user is admin
      if (userId !== process.env.ADMIN_UID) {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 })
    }

    const body = await request.json()
    const { campaignId, orderId } = body

    if (!campaignId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: campaignId and orderId' },
        { status: 400 }
      )
    }

    // Get payment record
    const paymentsSnapshot = await db.collection('payments')
      .where('orderId', '==', orderId)
      .limit(1)
      .get()
    
    if (paymentsSnapshot.empty) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      )
    }
    
    const paymentDoc = paymentsSnapshot.docs[0]
    const payment = paymentDoc.data()
    
    // Verify campaign ID matches
    if (payment.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID does not match payment record' },
        { status: 400 }
      )
    }
    
    // Check payment status
    if (payment.status === 'failed') {
      return NextResponse.json(
        { error: 'Cannot activate campaign with failed payment' },
        { status: 400 }
      )
    }
    
    // Check if user is blocked
    const userDoc = await db.collection('users').doc(payment.userId).get()
    if (userDoc.exists) {
      const userData = userDoc.data()
      if (userData?.isBlocked === true) {
        return NextResponse.json(
          { error: 'User is blocked, cannot activate campaign' },
          { status: 403 }
        )
      }
    }
    
    // Calculate expiry date
    const expiryDate = calculateExpiryDate(payment.planType)
    
    // Update campaign
    const campaignRef = db.collection('campaigns').doc(campaignId)
    await campaignRef.update({
      isActive: true,
      status: 'Active',
      isFreeCampaign: false,
      planType: payment.planType,
      amountPaid: payment.amount,
      paymentId: orderId,
      expiresAt: expiryDate ? Timestamp.fromDate(expiryDate) : null,
      lastPaymentAt: Timestamp.now()
    })
    
    // Update payment record if it was pending
    if (payment.status === 'pending') {
      await paymentDoc.ref.update({
        status: 'success',
        completedAt: Timestamp.now(),
        manuallyActivated: true,
        manuallyActivatedBy: userId,
        manuallyActivatedAt: Timestamp.now()
      })
    }
    
    // Create admin log
    await db.collection('logs').add({
      eventType: 'campaign_manual_activation',
      actorId: userId,
      description: `Campaign manually activated via admin API for order ${orderId}`,
      metadata: {
        campaignId,
        orderId,
        userId: payment.userId,
        amount: payment.amount,
        planType: payment.planType,
        expiresAt: expiryDate ? expiryDate.toISOString() : null
      },
      createdAt: Timestamp.now()
    })
    
    return NextResponse.json({
      success: true,
      message: 'Campaign activated successfully',
      campaign: {
        id: campaignId,
        planType: payment.planType,
        amountPaid: payment.amount,
        expiresAt: expiryDate ? expiryDate.toISOString() : null
      }
    })
    
  } catch (error: any) {
    console.error('Error fixing campaign:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
