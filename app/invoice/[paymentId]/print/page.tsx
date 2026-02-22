import { notFound } from 'next/navigation'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import PaymentInvoiceTemplate from '@/components/pdf/PaymentInvoiceTemplate'
import type { InvoiceData } from '@/lib/invoice'

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

const db = getFirestore()

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ paymentId: string }>
}) {
  try {
    const { paymentId } = await params

    // Get payment record
    const paymentDoc = await db.collection('payments').doc(paymentId).get()

    if (!paymentDoc.exists) {
      console.error('[Invoice Print] Payment not found:', paymentId)
      notFound()
    }

    const paymentData = paymentDoc.data()!

    // Check if payment was successful
    if (paymentData.status !== 'SUCCESS' && paymentData.status !== 'success') {
      console.error('[Invoice Print] Payment not successful:', paymentData.status)
      notFound()
    }

    // If invoice data doesn't exist, generate it now
    if (!paymentData.invoiceNumber) {
      const { generateInvoiceNumber, calculateGST, getPlanDisplayName, getPlanValidityDays, COMPANY_DETAILS } = await import('@/lib/invoice')

      const invoiceNumber = await generateInvoiceNumber()

      // Get GST rate from settings
      const settingsDoc = await db.collection('settings').doc('system').get()
      const sysSettings = settingsDoc.data() || {}
      const gstRate = sysSettings.gstPercentage !== undefined ? Number(sysSettings.gstPercentage) : 0

      const gstCalc = calculateGST(paymentData.amount || 0, gstRate)

      // Get user details
      let userName = 'User'
      let userEmail = ''
      try {
        const userDoc = await db.collection('users').doc(paymentData.userId).get()
        const userData = userDoc.data()
        userName = userData?.displayName || userData?.email || 'User'
        userEmail = userData?.email || ''
      } catch (error) {
        console.error('[Invoice Print] Error fetching user:', error)
      }

      // Get campaign details
      let campaignName = 'Campaign'
      try {
        const campaignDoc = await db.collection('campaigns').doc(paymentData.campaignId).get()
        const campaignData = campaignDoc.data()
        campaignName = campaignData?.campaignName || paymentData.metadata?.campaignName || 'Campaign'
      } catch (error) {
        console.error('[Invoice Print] Error fetching campaign:', error)
      }

      // Update payment with invoice data
      await db.collection('payments').doc(paymentId).update({
        invoiceNumber,
        invoiceDate: paymentData.completedAt || paymentData.createdAt,
        gstRate: gstRate,
        gstAmount: gstCalc.gstAmount,
        totalAmount: gstCalc.totalAmount,
        baseAmount: paymentData.amount,
        userName,
        userEmail,
        campaignName,
        planName: getPlanDisplayName(paymentData.planType),
        validityDays: getPlanValidityDays(paymentData.planType),
        companyDetails: COMPANY_DETAILS
      })

      // Refresh payment data
      const updatedDoc = await db.collection('payments').doc(paymentId).get()
      Object.assign(paymentData, updatedDoc.data())
    }

    // Prepare invoice data
    const invoiceData: InvoiceData = {
      invoiceNumber: paymentData.invoiceNumber,
      invoiceDate: paymentData.invoiceDate?.toDate() || paymentData.completedAt?.toDate() || new Date(),
      paymentId: paymentData.cashfreePaymentId || paymentData.orderId,
      orderId: paymentData.orderId,
      campaignName: paymentData.campaignName || 'Campaign',
      planType: paymentData.planType,
      planName: paymentData.planName || paymentData.planType,
      validityDays: paymentData.validityDays || 30,
      userName: paymentData.userName || 'User',
      userEmail: paymentData.userEmail || '',
      amount: paymentData.baseAmount || paymentData.amount,
      gstRate: paymentData.gstRate !== undefined ? paymentData.gstRate : 0,
      gstAmount: paymentData.gstAmount || 0,
      totalAmount: paymentData.totalAmount || paymentData.amount,
      activationDate: paymentData.completedAt?.toDate() || new Date(),
      expiryDate: paymentData.expiresAt?.toDate() || null,
      companyDetails: paymentData.companyDetails || {
        name: 'Phrames',
        email: 'support@phrames.cleffon.com',
        address: 'Cleffon Technologies, India',
      }
    }

    return <PaymentInvoiceTemplate data={invoiceData} />
  } catch (error) {
    console.error('[Invoice Print] Error rendering invoice:', error)
    throw error
  }
}
