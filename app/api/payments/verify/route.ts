import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { handlePaymentSuccess } from '../webhook/route'
import { PerformanceTracker } from '@/lib/monitoring'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(token)

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    // Call Cashfree API to verify the order directly
    const apiBase = process.env.CASHFREE_ENV === 'PRODUCTION' 
      ? 'https://api.cashfree.com/pg' 
      : 'https://sandbox.cashfree.com/pg'

    const response = await fetch(`${apiBase}/orders/${orderId}/payments`, {
      method: 'GET',
      headers: {
        'x-client-id': process.env.CASHFREE_CLIENT_ID!,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
        'x-api-version': '2023-08-01',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch from Cashfree API', await response.text());
      return NextResponse.json({ error: 'Failed to verify payment with gateway' }, { status: response.status })
    }

    const payments = await response.json()
    
    // Find the successful payment
    const successfulPayment = payments.find((p: any) => p.payment_status === 'SUCCESS')

    if (successfulPayment) {
      const db = adminDb      const paymentRef = await db.collection('payments').where('orderId', '==', orderId).limit(1).get()
      
      if (!paymentRef.empty) {
        const paymentData = paymentRef.docs[0].data()
        
        // Ensure user is the owner of the payment to prevent abuse
        if (paymentData.userId !== decodedToken.uid) {
           return NextResponse.json({ error: 'Unauthorized payment verification' }, { status: 403 })
        }

        // If the payment is not already processed as success
        if (paymentData.status?.toLowerCase() !== 'success') {
          // Construct synthetic webhook payload
          const syntheticPayload = {
            order: {
              order_id: orderId
            },
            payment: successfulPayment
          }

          const tracker = new PerformanceTracker('payment_verification')
          await handlePaymentSuccess(syntheticPayload, tracker)
          
          return NextResponse.json({ success: true, message: 'Payment verified and campaign activated' })
        } else {
          // Already processed
          return NextResponse.json({ success: true, message: 'Payment already processed' })
        }
      } else {
        return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
      }
    } else {
       return NextResponse.json({ success: false, message: 'No successful payment found for this order' })
    }

  } catch (error: any) {
    console.error('Verify Route Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
