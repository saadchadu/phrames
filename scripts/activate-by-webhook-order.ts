/**
 * Activate campaign using the order ID from webhook logs
 * This is useful when payment record exists but order IDs don't match
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

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

async function activateByCampaignId(campaignId: string) {
  console.log('\n=== Activating Campaign ===\n')
  console.log('Campaign ID:', campaignId)
  
  try {
    // Find payment by campaign ID (without orderBy to avoid index requirement)
    const paymentsSnapshot = await db.collection('payments')
      .where('campaignId', '==', campaignId)
      .limit(1)
      .get()
    
    if (paymentsSnapshot.empty) {
      console.log('\n❌ No payment found for this campaign')
      return
    }
    
    const paymentDoc = paymentsSnapshot.docs[0]
    const payment = paymentDoc.data()
    
    console.log('\n💳 Payment Details:')
    console.log('  Payment ID:', paymentDoc.id)
    console.log('  Order ID:', payment.orderId)
    console.log('  Status:', payment.status)
    console.log('  Amount:', payment.amount)
    console.log('  Plan Type:', payment.planType)
    console.log('  User ID:', payment.userId)
    
    // Calculate expiry date
    const expiryDate = calculateExpiryDate(payment.planType)
    console.log('\n📋 Activating Campaign...')
    
    // Update campaign
    const campaignRef = db.collection('campaigns').doc(campaignId)
    await campaignRef.update({
      isActive: true,
      status: 'Active',
      isFreeCampaign: false,
      planType: payment.planType,
      amountPaid: payment.amount,
      paymentId: payment.orderId,
      expiresAt: expiryDate ? Timestamp.fromDate(expiryDate) : null,
      lastPaymentAt: Timestamp.now()
    })
    
    console.log('✅ Campaign updated successfully')
    
    // Update payment record
    await paymentDoc.ref.update({
      status: 'success',
      completedAt: Timestamp.now(),
      manuallyActivated: true
    })
    
    console.log('✅ Payment record updated')
    
    // Create admin log
    await db.collection('logs').add({
      eventType: 'campaign_manual_activation',
      actorId: 'admin',
      description: `Campaign manually activated (order ID mismatch workaround)`,
      metadata: {
        campaignId,
        paymentId: paymentDoc.id,
        orderId: payment.orderId,
        userId: payment.userId,
        amount: payment.amount,
        planType: payment.planType,
        expiresAt: expiryDate ? expiryDate.toISOString() : null
      },
      createdAt: Timestamp.now()
    })
    
    console.log('✅ Admin log created')
    
    console.log('\n=== Campaign Activated Successfully ===')
    console.log('  Campaign ID:', campaignId)
    console.log('  Plan Type:', payment.planType)
    console.log('  Amount Paid:', payment.amount)
    console.log('  Expires At:', expiryDate ? expiryDate.toISOString() : 'Never')
    console.log('\n')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

const campaignId = process.argv[2]

if (!campaignId) {
  console.error('Usage: npx tsx scripts/activate-by-webhook-order.ts <campaignId>')
  console.error('\nExample:')
  console.error('  npx tsx scripts/activate-by-webhook-order.ts EMjwUjJWru0sQxNQgLbR')
  process.exit(1)
}

activateByCampaignId(campaignId).then(() => {
  console.log('Done!')
  process.exit(0)
}).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
