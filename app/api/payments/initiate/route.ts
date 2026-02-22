import { NextRequest, NextResponse } from 'next/server'
import { getCampaign } from '@/lib/firestore'
import { isValidPlanType, verifyCashfreeConfig, PRICING_PLANS } from '@/lib/cashfree'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
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
  const tracker = new PerformanceTracker('payment_initiation')
  trackRequest()

  try {
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
    let emailVerified: boolean
    try {
      const decodedToken = await getAuth().verifyIdToken(token)
      userId = decodedToken.uid
      emailVerified = decodedToken.email_verified || false

      // Require email verification for payments
      if (!emailVerified) {
        trackError()
        logApiError({
          endpoint: '/api/payments/initiate',
          error: 'Email not verified',
          userId,
          statusCode: 403
        })
        tracker.end(false)
        return NextResponse.json(
          { error: 'Please verify your email address before making a payment. Check your inbox for the verification link.' },
          { status: 403 }
        )
      }
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
    const { campaignId, planType, couponCode } = body

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

    // Get price from Firestore settings
    let amount: number
    try {
      const db = getFirestore()
      const [plansDoc, systemDoc] = await Promise.all([
        db.collection('settings').doc('plans').get(),
        db.collection('settings').doc('system').get()
      ])

      if (!plansDoc.exists) {
        // Fallback to hardcoded prices if Firestore is not configured
        amount = PRICING_PLANS[planType].price
      } else {
        const plansData = plansDoc.data()
        const systemData = systemDoc.exists ? systemDoc.data() : {}
        const offersEnabled = systemData?.offersEnabled ?? false

        // Get base price
        const basePrice = plansData?.[planType] ?? PRICING_PLANS[planType].price

        // Apply discount if offers are enabled
        if (offersEnabled && plansData?.discounts?.[planType]) {
          const discount = plansData.discounts[planType]
          amount = Math.round(basePrice - (basePrice * discount / 100))
        } else {
          amount = basePrice
        }
      }
    } catch (error) {
      amount = PRICING_PLANS[planType].price
    }

    let originalAmount = amount
    let finalAmount = amount
    let discountAmount = 0
    let appliedCoupon = null

    // Process coupon if provided
    if (couponCode) {
      const codeTrimmed = couponCode.toUpperCase().trim()
      const db = getFirestore()
      const couponRef = db.collection('coupons').doc(codeTrimmed)
      const couponSnap = await couponRef.get()

      if (couponSnap.exists) {
        const coupon = couponSnap.data()

        let isValid = true
        const now = new Date()

        if (!coupon?.isActive) isValid = false
        else if (coupon.validFrom && (() => { const d = typeof coupon.validFrom.toDate === 'function' ? coupon.validFrom.toDate() : new Date(coupon.validFrom); d.setUTCHours(0, 0, 0, 0); d.setHours(d.getHours() - 14); return d > now })()) isValid = false
        else if (coupon.validUntil && (() => { const d = typeof coupon.validUntil.toDate === 'function' ? coupon.validUntil.toDate() : new Date(coupon.validUntil); d.setUTCHours(23, 59, 59, 999); d.setHours(d.getHours() + 14); return d < now })()) isValid = false
        else if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) isValid = false
        else if (coupon.applicablePlans && coupon.applicablePlans.length > 0 && !coupon.applicablePlans.includes(planType)) isValid = false
        else if (coupon.minAmount && amount < coupon.minAmount) isValid = false

        if (isValid && coupon?.perUserLimit) {
          const redemptionSnap = await couponRef.collection('redemptions').doc(userId).get()
          if (redemptionSnap.exists) {
            const userRedemption = redemptionSnap.data()
            if (userRedemption && userRedemption.count >= coupon.perUserLimit) {
              isValid = false
            }
          }
        }

        if (isValid && coupon) {
          if (coupon.type === 'flat') {
            discountAmount = Math.min(coupon.value, amount)
          } else if (coupon.type === 'percent') {
            discountAmount = Math.round((amount * coupon.value) / 100)
            discountAmount = Math.min(discountAmount, amount)
          }
          finalAmount = amount - discountAmount
          appliedCoupon = codeTrimmed
        }
      }
    }

    // Safety check - Cashfree API limit is minimum ₹1 to initiate.
    if (finalAmount < 1) {
      finalAmount = 1; // Or handle this differently if you want 100% discount without cashfree.
    }

    amount = finalAmount // Order amount for Cashfree

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
      const { Cashfree: CashfreeSDK, CFEnvironment } = await import('cashfree-pg')
      const environment = process.env.CASHFREE_ENV === 'PRODUCTION'
        ? CFEnvironment.PRODUCTION
        : CFEnvironment.SANDBOX

      const cashfree = new CashfreeSDK(
        environment,
        process.env.CASHFREE_CLIENT_ID!,
        process.env.CASHFREE_CLIENT_SECRET!
      )

      const response = await cashfree.PGCreateOrder(orderRequest)
      cashfreeResponse = response.data
    } catch (error: any) {
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

    // Store payment record using Firebase Admin
    const paymentRecord: any = {
      orderId,
      campaignId,
      userId,
      planType,
      amount: finalAmount, // Store what we actually charge
      originalAmount,
      discountAmount,
      couponCode: appliedCoupon || null,
      currency: 'INR',
      status: 'pending',
      cashfreeOrderId: cashfreeResponse.cf_order_id || orderId,
      metadata: {
        campaignName: campaign.campaignName,
        userEmail: campaign.createdByEmail || ''
      },
      createdAt: Timestamp.now()
    }

    try {
      const db = getFirestore()
      const paymentRef = await db.collection('payments').add(paymentRecord)

      // Also log to admin logs
      await db.collection('logs').add({
        eventType: 'payment_initiated',
        actorId: userId,
        description: `Payment initiated for campaign ${campaignId}`,
        metadata: {
          paymentRecordId: paymentRef.id,
          orderId: orderId,
          cashfreeOrderId: cashfreeResponse.cf_order_id || orderId,
          campaignId,
          amount,
          planType
        },
        createdAt: Timestamp.now()
      })
    } catch (recordError: any) {
      logApiError({
        endpoint: '/api/payments/initiate',
        error: `Failed to create payment record: ${recordError.message}`,
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

    // Check if we have payment_session_id
    if (!cashfreeResponse.payment_session_id) {
      trackError()
      logApiError({
        endpoint: '/api/payments/initiate',
        error: 'No payment session ID in Cashfree response',
        userId,
        campaignId,
        statusCode: 500,
        metadata: { cashfreeResponse }
      })
      tracker.end(false)
      return NextResponse.json(
        { error: 'Failed to get payment session from payment gateway' },
        { status: 500 }
      )
    }

    tracker.end(true)

    // Return payment session ID for frontend Cashfree SDK
    return NextResponse.json({
      success: true,
      orderId: cashfreeResponse.order_id,
      paymentSessionId: cashfreeResponse.payment_session_id
    })

  } catch (error: any) {
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
