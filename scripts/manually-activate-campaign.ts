/**
 * Script to manually activate a campaign after successful payment
 * Usage: npx ts-node -r tsconfig-paths/register scripts/manually-activate-campaign.ts <campaignId> <orderId>
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

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

async function manuallyActivateCampaign(campaignId: string, orderId: string) {
  console.log('\n=== Manually Activating Campaign ===\n')
  console.log('Campaign ID:', campaignId)
  console.log('Order ID:', orderId)
  
  try {
    // Get payment record
    const paymentsSnapshot = await db.collection('payments')
      .where('orderId', '==', orderId)
      .limit(1)
      .get()
    
    if (paymentsSnapshot.empty) {
      console.error('❌ Payment record not found for order ID:', orderId)
      return
    }
    
    const paymentDoc = paymentsSnapshot.docs[0]
    const payment = paymentDoc.data()
    
    console.log('\n💳 Payment Details:')
    console.log('  Status:', payment.status)
    console.log('  Amount:', payment.amount)
    console.log('  Plan Type:', payment.planType)
    console.log('  User ID:', payment.userId)
    
    if (payment.status !== 'success' && payment.status !== 'pending') {
      console.error('❌ Payment status is not success or pending:', payment.status)
      console.log('   Cannot activate campaign with failed payment')
      return
    }
    
    // Check if user is blocked
    const userDoc = await db.collection('users').doc(payment.userId).get()
    if (userDoc.exists) {
      const userData = userDoc.data()
      if (userData?.isBlocked === true) {
        console.error('❌ User is blocked, cannot activate campaign')
        return
      }
    }
    
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
      paymentId: orderId,
      expiresAt: expiryDate ? Timestamp.fromDate(expiryDate) : null,
      lastPaymentAt: Timestamp.now()
    })
    
    console.log('✅ Campaign updated successfully')
    
    // Update payment record if it was pending
    if (payment.status === 'pending') {
      await paymentDoc.ref.update({
        status: 'success',
        completedAt: Timestamp.now(),
        manuallyActivated: true
      })
      console.log('✅ Payment record updated to success')
    }
    
    // Create admin log
    await db.collection('logs').add({
      eventType: 'campaign_manual_activation',
      actorId: 'admin',
      description: `Campaign manually activated for order ${orderId}`,
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
    
    console.log('✅ Admin log created')
    
    console.log('\n=== Campaign Activated Successfully ===')
    console.log('  Campaign ID:', campaignId)
    console.log('  Plan Type:', payment.planType)
    console.log('  Amount Paid:', payment.amount)
    console.log('  Expires At:', expiryDate ? expiryDate.toISOString() : 'Never')
    console.log('\n')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Get arguments from command line
const campaignId = process.argv[2]
const orderId = process.argv[3]

if (!campaignId || !orderId) {
  console.error('Usage: npx ts-node -r tsconfig-paths/register scripts/manually-activate-campaign.ts <campaignId> <orderId>')
  console.error('\nExample:')
  console.error('  npx ts-node -r tsconfig-paths/register scripts/manually-activate-campaign.ts abc123 order_1234567890_abc12345')
  process.exit(1)
}

manuallyActivateCampaign(campaignId, orderId).then(() => {
  console.log('Done!')
  process.exit(0)
}).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
