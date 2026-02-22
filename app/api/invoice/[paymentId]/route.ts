import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { generateInvoicePDF } from '@/lib/pdf/generateInvoicePDF'
import { COMPANY_DETAILS } from '@/lib/invoice'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params

    // Get authorization token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.split('Bearer ')[1]

    // Verify Firebase token
    let userId: string
    let isAdmin = false
    try {
      const decodedToken = await getAuth().verifyIdToken(token)
      userId = decodedToken.uid
      isAdmin = decodedToken.admin === true || decodedToken.isAdmin === true
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Get payment record
    const paymentDoc = await db.collection('payments').doc(paymentId).get()

    if (!paymentDoc.exists) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    const paymentData = paymentDoc.data()!

    // Verify ownership (user can only access their own invoices, unless admin)
    if (!isAdmin && paymentData.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if payment was successful or refunded
    const validStatuses = ['SUCCESS', 'success', 'REFUNDED', 'refunded', 'Refunded'];
    if (!validStatuses.includes(paymentData.status)) {
      return NextResponse.json(
        { error: 'Invoice not available for unsuccessful payments' },
        { status: 400 }
      )
    }

    // Check if invoice data exists - if not, generate it now
    if (!paymentData.invoiceNumber) {
      // Generate invoice data for old payments
      const { generateInvoiceNumber, getPlanDisplayName, getPlanValidityDays } = await import('@/lib/invoice')

      const invoiceNumber = await generateInvoiceNumber()

      // Get user details
      const userDoc = await db.collection('users').doc(paymentData.userId).get()
      const userData = userDoc.data()

      // Get campaign details
      const campaignDoc = await db.collection('campaigns').doc(paymentData.campaignId).get()
      const campaignData = campaignDoc.data()

      // Update payment with invoice data
      await db.collection('payments').doc(paymentId).update({
        invoiceNumber,
        invoiceDate: paymentData.completedAt || paymentData.createdAt,
        totalAmount: paymentData.baseAmount || paymentData.amount || 0,
        baseAmount: paymentData.baseAmount || paymentData.amount,
        userName: userData?.displayName || userData?.email || 'User',
        userEmail: userData?.email || '',
        campaignName: campaignData?.campaignName || paymentData.metadata?.campaignName || 'Campaign',
        planName: getPlanDisplayName(paymentData.planType),
        validityDays: getPlanValidityDays(paymentData.planType),
        companyDetails: COMPANY_DETAILS
      })

      // Refresh payment data
      const updatedDoc = await db.collection('payments').doc(paymentId).get()
      Object.assign(paymentData, updatedDoc.data())
    }

    // Get base URL - prioritize NEXT_PUBLIC_APP_URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      `https://${request.headers.get('host')}`

    // Generate PDF using Puppeteer
    const pdfBuffer = await generateInvoicePDF({
      paymentId,
      baseUrl
    })

    // Return PDF
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${paymentData.invoiceNumber}.pdf"`,
        'Cache-Control': 'private, no-cache',
      },
    })

  } catch (error: any) {
    console.error('Error generating invoice:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      {
        error: 'Failed to generate invoice',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
