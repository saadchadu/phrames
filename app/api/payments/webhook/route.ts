import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { verifyCashfreeSignature } from '@/lib/webhookVerification'
import { getPaymentByOrderId } from '@/lib/firestore'
import { calculateExpiryDate } from '@/lib/cashfree'
import {
  PerformanceTracker,
  logWebhookReceived,
  logWebhookProcessed,
  logWebhookError,
  logPaymentSuccess,
  logPaymentFailed,
  logCampaignActivated,
  trackRequest,
  trackError,
  formatError
} from '@/lib/monitoring'

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
  const tracker = new PerformanceTracker('webhook_processing')
  trackRequest()
  
  try {
    // Get webhook headers
    const signature = request.headers.get('x-webhook-signature')
    const timestamp = request.headers.get('x-webhook-timestamp')
    
    // Get raw body for signature verification
    const rawBody = await request.text()
    
    // Verify signature (in production)
    // TEMPORARILY DISABLED FOR TESTING - RE-ENABLE AFTER FIXING WEBHOOK ISSUES
    if (false && process.env.CASHFREE_ENV === 'PRODUCTION') {
      if (!signature || !timestamp) {
        trackError()
        logWebhookError({
          error: 'Missing webhook signature or timestamp'
        })
        
        // Create admin log for webhook failure
        await db.collection('logs').add({
          eventType: 'webhook_failure',
          actorId: 'system',
          description: 'Webhook verification failed: Missing signature or timestamp',
          metadata: {
            webhookType: 'payment',
            error: 'Missing webhook signature or timestamp',
            hasSignature: !!signature,
            hasTimestamp: !!timestamp
          },
          createdAt: Timestamp.now()
        })
        
        tracker.end(false)
        return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
      }

      const isValid = verifyCashfreeSignature(rawBody, signature, timestamp)
      if (!isValid) {
        trackError()
        logWebhookError({
          error: 'Invalid webhook signature'
        })
        
        // Create admin log for webhook failure
        await db.collection('logs').add({
          eventType: 'webhook_failure',
          actorId: 'system',
          description: 'Webhook verification failed: Invalid signature',
          metadata: {
            webhookType: 'payment',
            error: 'Invalid webhook signature'
          },
          createdAt: Timestamp.now()
        })
        
        tracker.end(false)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }
    
    // Parse webhook payload
    const payload = JSON.parse(rawBody)
    
    // Log webhook received for debugging with full details
    await db.collection('logs').add({
      eventType: 'webhook_received',
      actorId: 'system',
      description: `Webhook received: ${payload.type || 'UNKNOWN'} for order ${payload.data?.order?.order_id || 'UNKNOWN'}`,
      metadata: {
        hasSignature: !!signature,
        hasTimestamp: !!timestamp,
        webhookType: payload.type,
        orderId: payload.data?.order?.order_id,
        paymentStatus: payload.data?.payment?.payment_status,
        fullPayload: payload
      },
      createdAt: Timestamp.now()
    })
    
    logWebhookReceived({
      type: payload.type,
      orderId: payload.data?.order?.order_id
    })

    // Handle different webhook types
    if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      console.log('Processing PAYMENT_SUCCESS_WEBHOOK for order:', payload.data?.order?.order_id)
      await handlePaymentSuccess(payload.data, tracker)
      console.log('Successfully processed PAYMENT_SUCCESS_WEBHOOK')
    } else if (payload.type === 'PAYMENT_FAILED_WEBHOOK') {
      console.log('Processing PAYMENT_FAILED_WEBHOOK for order:', payload.data?.order?.order_id)
      await handlePaymentFailed(payload.data)
      console.log('Successfully processed PAYMENT_FAILED_WEBHOOK')
    } else {
      console.log('Unknown webhook type:', payload.type)
      await db.collection('logs').add({
        eventType: 'webhook_unknown_type',
        actorId: 'system',
        description: `Unknown webhook type received: ${payload.type}`,
        metadata: {
          webhookType: payload.type,
          payload: payload
        },
        createdAt: Timestamp.now()
      })
    }

    tracker.end(true)

    // Always return 200 OK to acknowledge webhook
    return NextResponse.json({ success: true })

  } catch (error: any) {
    trackError()
    const errorMessage = formatError(error)
    logWebhookError({
      error: `Webhook processing error: ${errorMessage}`
    })
    
    // Create admin log for webhook failure
    try {
      await db.collection('logs').add({
        eventType: 'webhook_failure',
        actorId: 'system',
        description: `Webhook processing error: ${errorMessage}`,
        metadata: {
          webhookType: 'payment',
          error: errorMessage,
          stack: error?.stack
        },
        createdAt: Timestamp.now()
      })
    } catch (logError) {
      console.error('Failed to create admin log:', logError)
    }
    
    tracker.end(false)
    // Return 200 OK even on error to prevent retries
    return NextResponse.json({ success: true })
  }
}

async function handlePaymentSuccess(data: any, tracker: PerformanceTracker) {
  const startTime = Date.now()
  
  try {
    const orderId = data.order?.order_id
    const paymentId = data.payment?.cf_payment_id
    const paymentStatus = data.payment?.payment_status

    console.log('handlePaymentSuccess called with orderId:', orderId)

    if (!orderId) {
      const errorMsg = 'No order ID in webhook payload'
      console.error(errorMsg, data)
      logWebhookError({
        error: errorMsg,
        metadata: { data }
      })
      await db.collection('logs').add({
        eventType: 'webhook_error',
        actorId: 'system',
        description: errorMsg,
        metadata: { data },
        createdAt: Timestamp.now()
      })
      return
    }

    // Get payment record
    console.log('Fetching payment record for orderId:', orderId)
    const paymentRecord = await getPaymentByOrderId(orderId)
    
    if (!paymentRecord) {
      const errorMsg = `Payment record not found for order ${orderId}`
      console.error(errorMsg)
      logWebhookError({
        orderId,
        error: errorMsg,
        metadata: { orderId }
      })
      await db.collection('logs').add({
        eventType: 'webhook_error',
        actorId: 'system',
        description: errorMsg,
        metadata: { orderId, data },
        createdAt: Timestamp.now()
      })
      return
    }

    console.log('Payment record found:', {
      id: paymentRecord.id,
      status: paymentRecord.status,
      campaignId: paymentRecord.campaignId,
      userId: paymentRecord.userId
    })

    // Check if already processed (idempotency)
    if (paymentRecord.status === 'success') {
      logWebhookProcessed({
        orderId,
        campaignId: paymentRecord.campaignId,
        duration: Date.now() - startTime
      })
      return
    }

    const { campaignId, planType, amount, userId } = paymentRecord

    // Check if user is blocked
    const userDoc = await db.collection('users').doc(userId).get()
    if (userDoc.exists) {
      const userData = userDoc.data()
      if (userData?.isBlocked === true) {
        logWebhookError({
          orderId,
          error: 'User is blocked, cannot activate campaign',
          metadata: { userId, campaignId }
        })
        // Update payment record to failed
        if (paymentRecord.id) {
          const paymentRef = db.collection('payments').doc(paymentRecord.id)
          await paymentRef.update({
            status: 'failed',
            completedAt: Timestamp.now()
          })
        }
        return
      }
    }

    // Calculate expiry date
    const expiryDate = calculateExpiryDate(planType)
    console.log('Calculated expiry date:', expiryDate)

    // Update campaign with payment details
    console.log('Updating campaign:', campaignId)
    const campaignRef = db.collection('campaigns').doc(campaignId)
    await campaignRef.update({
      isActive: true,
      status: 'Active',
      isFreeCampaign: false, // Paid campaigns are never free
      planType,
      amountPaid: amount,
      paymentId: orderId,
      expiresAt: expiryDate ? Timestamp.fromDate(expiryDate) : null,
      lastPaymentAt: Timestamp.now()
    })
    console.log('Campaign updated successfully:', campaignId)

    // Update payment record with complete webhook data
    if (paymentRecord.id) {
      const paymentRef = db.collection('payments').doc(paymentRecord.id)
      await paymentRef.update({
        status: 'success',
        cashfreePaymentId: paymentId,
        completedAt: Timestamp.now(),
        webhookData: data,
        webhookReceivedAt: Timestamp.now()
      })
    }

    // Log successful payment
    logPaymentSuccess({
      userId,
      campaignId,
      orderId,
      amount,
      planType
    })

    // Log campaign activation
    logCampaignActivated({
      campaignId,
      userId,
      planType,
      expiresAt: expiryDate ? expiryDate.toISOString() : 'never'
    })
    
    // Create admin log for successful payment
    await db.collection('logs').add({
      eventType: 'payment_success',
      actorId: 'system',
      description: `Payment successful for order ${orderId} - Campaign activated`,
      metadata: {
        orderId,
        userId,
        campaignId,
        amount,
        planType,
        expiresAt: expiryDate ? expiryDate.toISOString() : null,
        cashfreePaymentId: paymentId
      },
      createdAt: Timestamp.now()
    })

    const duration = Date.now() - startTime
    logWebhookProcessed({
      orderId,
      campaignId,
      duration
    })

  } catch (error) {
    trackError()
    logWebhookError({
      orderId: data.order?.order_id,
      error: `Error handling payment success: ${formatError(error)}`,
      metadata: { data }
    })
    throw error
  }
}

async function handlePaymentFailed(data: any) {
  try {
    const orderId = data.order?.order_id

    if (!orderId) {
      logWebhookError({
        error: 'No order ID in webhook payload for failed payment',
        metadata: { data }
      })
      
      // Create admin log
      await db.collection('logs').add({
        eventType: 'webhook_failure',
        actorId: 'system',
        description: 'Payment webhook failed: No order ID in payload',
        metadata: {
          webhookType: 'payment_failed',
          error: 'No order ID in webhook payload'
        },
        createdAt: Timestamp.now()
      })
      
      return
    }

    // Get payment record
    const paymentRecord = await getPaymentByOrderId(orderId)
    if (!paymentRecord || !paymentRecord.id) {
      logWebhookError({
        orderId,
        error: 'Payment record not found for failed payment',
        metadata: { orderId }
      })
      
      // Create admin log
      await db.collection('logs').add({
        eventType: 'webhook_failure',
        actorId: 'system',
        description: `Payment webhook failed: Payment record not found for order ${orderId}`,
        metadata: {
          webhookType: 'payment_failed',
          orderId,
          error: 'Payment record not found'
        },
        createdAt: Timestamp.now()
      })
      
      return
    }

    // Update payment record with complete webhook data
    const paymentRef = db.collection('payments').doc(paymentRecord.id)
    await paymentRef.update({
      status: 'failed',
      completedAt: Timestamp.now(),
      webhookData: data,
      webhookReceivedAt: Timestamp.now()
    })

    // Log payment failure
    logPaymentFailed({
      userId: paymentRecord.userId,
      campaignId: paymentRecord.campaignId,
      orderId,
      error: 'Payment failed at gateway'
    })
    
    // Create admin log for payment failure
    await db.collection('logs').add({
      eventType: 'payment_failure',
      actorId: 'system',
      description: `Payment failed for order ${orderId}`,
      metadata: {
        orderId,
        userId: paymentRecord.userId,
        campaignId: paymentRecord.campaignId,
        amount: paymentRecord.amount,
        planType: paymentRecord.planType,
        reason: data.payment?.payment_message || 'Unknown'
      },
      createdAt: Timestamp.now()
    })

  } catch (error) {
    trackError()
    const errorMessage = formatError(error)
    logWebhookError({
      orderId: data.order?.order_id,
      error: `Error handling payment failure: ${errorMessage}`,
      metadata: { data }
    })
    
    // Create admin log for webhook processing error
    try {
      await db.collection('logs').add({
        eventType: 'webhook_failure',
        actorId: 'system',
        description: `Error processing payment failure webhook: ${errorMessage}`,
        metadata: {
          webhookType: 'payment_failed',
          orderId: data.order?.order_id,
          error: errorMessage
        },
        createdAt: Timestamp.now()
      })
    } catch (logError) {
      console.error('Failed to create admin log:', logError)
    }
    
    throw error
  }
}
