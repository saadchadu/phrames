import { NextRequest, NextResponse } from 'next/server'
import { getCampaign, createPaymentRecord } from '@/lib/firestore'
import { getPlanPrice, isValidPlanType, verifyCashfreeConfig } from '@/lib/cashfree'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import type { CreateOrderRequest } from 'cashfree-pg'
import {
  PerformanceTracker,
  logPaymentInitiated,
  logApiError,
  trackRequest,
  trackError,
  formatError,
  sanitizeErrorForClient
} from '@/lib/monitoring'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

export async function POST(request: NextRequest) {
  console.log('=== Payment Initiate API Called ===')
  
  const tracker = new PerformanceTracker('payment_initiation')
  trackRequest()
  
  try {
    console.log('Starting payment initiation...')
    // Verify Cashfree configuration
    const configCheck = verifyCashfreeConfig()
    if (!configCheck.valid) {
      trackError()
      logApiError({
        endpoint: '/api/payments/initiate',
        error: `Cashfree configuration error: ${configCheck.error}`,
        statusCode: 500
      })
      tracker.end(false)
      return NextResponse.json(
        { error: 'Payment system is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Get authorization token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      trackError()
      logApiError({
        endpoint: '/api/payments/initiate',
        error: 'Missing authorization header',
        statusCode: 401
      })
      tracker.end(false)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.split('Bearer ')[1]
    
    // Verify Firebase token
    let userId: string
    try {
      const decodedToken = await getAuth().verifyIdToken(token)
      userId = decodedToken.uid
    } catch (error) {
      trackError()
      logApiError({
        endpoint: '/api/payments/initiate',
        error: `Token verification failed: ${formatError(error)}`,
        statusCode: 401
      })
      tracker.end(false)
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { campaignId, planType } = body

    // Validate inputs
    if (!campaignId || !planType) {
      trackError()
      logApiError({
        endpoint: '/api/payments/initiate',
        error: 'Missing required fields',
        userId,
        statusCode: 400,
        metadata: { campaignId, planType }
      })
      tracker.end(false)
      return NextResponse.json(
        { error: 'Missing required fields: campaignId and planType' },
        { status: 400 }
      )
    }

    if (!isValidPlanType(planType)) {
      trackError()
      logApiError({
        endpoint: '/api/payments/initiate',
        error: 'Invalid plan type',
        userId,
        campaignId,
        statusCode: 400,
        metadata: { planType }
      })
      tracker.end(false)
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      )
    }

    // Get campaign and verify ownership
    const campaign = await getCampaign(campaignId)
    if (!campaign) {
      trackError()
      logApiError({
        endpoint: '/api/payments/initiate',
        error: 'Campaign not found',
        userId,
        campaignId,
        statusCode: 404
      })
      tracker.end(false)
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.createdBy !== userId) {
      trackError()
      logApiError({
        endpoint: '/api/payments/initiate',
        error: 'Permission denied',
        userId,
        campaignId,
        statusCode: 403
      })
      tracker.end(false)
      return NextResponse.json(
        { error: 'You do not have permission to activate this campaign' },
        { status: 403 }
      )
    }

    // Prevent payment initiation for free campaigns
    if (campaign.isFreeCampaign === true) {
      trackError()
      logApiError({
        endpoint: '/api/payments/initiate',
        error: 'Cannot initiate payment for free campaign',
        userId,
        campaignId,
        statusCode: 400
      })
      tracker.end(false)
      return NextResponse.json(
        { error: 'This is a free campaign and does not require payment' },
        { status: 400 }
      )
    }

    // Calculate amount
    const amount = getPlanPrice(planType)
    const orderId = `order_${Date.now()}_${campaignId.substring(0, 8)}`

    // Create Cashfree order
    // For production Cashfree, URLs must be HTTPS
    // In development, we'll use a placeholder HTTPS URL that Cashfree accepts
    const isDevelopment = process.env.NODE_ENV === 'development'
    const baseUrl = isDevelopment 
      ? 'https://phrames.cleffon.com' // Use production URL as placeholder for dev testing
      : process.env.NEXT_PUBLIC_APP_URL
    
    const orderRequest: CreateOrderRequest = {
      order_amount: amount,
      order_currency: 'INR',
      order_id: orderId,
      customer_details: {
        customer_id: userId,
        customer_email: campaign.createdByEmail || 'user@example.com',
        customer_phone: '9999999999' // Default phone, Cashfree requires this
      },
      order_meta: {
        return_url: `${baseUrl}/dashboard?payment=success&campaignId=${campaignId}`,
        notify_url: `${baseUrl}/api/payments/webhook`
      },
      order_note: `Campaign: ${campaign.campaignName} - Plan: ${planType}`
    }

    let cashfreeResponse
    try {
      console.log('Initializing Cashfree SDK...')
      const { Cashfree: CashfreeSDK, CFEnvironment } = await import('cashfree-pg')
      const environment = process.env.CASHFREE_ENV === 'PRODUCTION' 
        ? CFEnvironment.PRODUCTION 
        : CFEnvironment.SANDBOX
      
      const cashfree = new CashfreeSDK(
        environment,
        process.env.CASHFREE_CLIENT_ID!,
        process.env.CASHFREE_CLIENT_SECRET!
      )
      
      console.log('Creating Cashfree order with request:', JSON.stringify(orderRequest, null, 2))
      const response = await cashfree.PGCreateOrder(orderRequest)
      console.log('Cashfree response received successfully')
      console.log('Order ID:', response.data?.order_id)
      console.log('Payment Session ID:', response.data?.payment_session_id)
      cashfreeResponse = response.data
    } catch (error: any) {
      console.error('Cashfree order creation error:', error.message)
      if (error.response?.data) {
        console.error('Cashfree error response:', error.response.data)
      }
      console.error('Error status:', error.response?.status || 'unknown')
      trackError()
      logApiError({
        endpoint: '/api/payments/initiate',
        error: `Cashfree order creation failed: ${formatError(error)}`,
        userId,
        campaignId,
        statusCode: 500,
        metadata: { 
          planType, 
          amount,
          errorMessage: error.message,
          errorResponse: error.response?.data 
        }
      })
      tracker.end(false)
      return NextResponse.json(
        { 
          error: 'Failed to create payment order. Please try again.',
          details: error.response?.data || error.message 
        },
        { status: 500 }
      )
    }

    // Store payment record
    const paymentRecord = {
      orderId,
      campaignId,
      userId,
      planType,
      amount,
      currency: 'INR',
      status: 'pending' as const,
      cashfreeOrderId: cashfreeResponse.cf_order_id || orderId,
      metadata: {
        campaignName: campaign.campaignName,
        userEmail: campaign.createdByEmail || ''
      }
    }

    const { error: recordError } = await createPaymentRecord(paymentRecord)
    if (recordError) {
      logApiError({
        endpoint: '/api/payments/initiate',
        error: `Failed to create payment record: ${recordError}`,
        userId,
        campaignId,
        statusCode: 500,
        metadata: { orderId }
      })
      // Continue anyway, we can recover from this
    }

    // Log successful payment initiation
    logPaymentInitiated({
      userId,
      campaignId,
      planType,
      amount,
      orderId
    })

    // Construct payment link using payment_session_id
    const environment = process.env.CASHFREE_ENV === 'PRODUCTION' ? 'payments' : 'sandbox'
    const paymentLink = `https://${environment}.cashfree.com/pay/${cashfreeResponse.payment_session_id}`

    tracker.end(true)

    // Return payment link
    return NextResponse.json({
      success: true,
      paymentLink,
      orderId: cashfreeResponse.order_id,
      paymentSessionId: cashfreeResponse.payment_session_id
    })

  } catch (error: any) {
    console.error('=== PAYMENT INITIATION ERROR ===')
    console.error('Error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    trackError()
    logApiError({
      endpoint: '/api/payments/initiate',
      error: `Unexpected error: ${formatError(error)}`,
      statusCode: 500
    })
    tracker.end(false)
    return NextResponse.json(
      { 
        error: sanitizeErrorForClient(error),
        message: error.message,
        details: 'Check server logs for more information'
      },
      { status: 500 }
    )
  }
}
