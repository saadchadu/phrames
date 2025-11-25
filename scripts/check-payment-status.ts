/**
 * Script to check payment and campaign status after payment
 * Usage: npx ts-node -r tsconfig-paths/register scripts/check-payment-status.ts <campaignId>
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
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

async function checkPaymentStatus(campaignId: string) {
  console.log('\n=== Checking Payment Status ===\n')
  console.log('Campaign ID:', campaignId)
  
  try {
    // Get campaign
    const campaignDoc = await db.collection('campaigns').doc(campaignId).get()
    
    if (!campaignDoc.exists) {
      console.error('❌ Campaign not found!')
      return
    }
    
    const campaign = campaignDoc.data()
    console.log('\n📋 Campaign Status:')
    console.log('  Name:', campaign?.campaignName)
    console.log('  isActive:', campaign?.isActive)
    console.log('  status:', campaign?.status)
    console.log('  isFreeCampaign:', campaign?.isFreeCampaign)
    console.log('  planType:', campaign?.planType)
    console.log('  amountPaid:', campaign?.amountPaid)
    console.log('  paymentId:', campaign?.paymentId)
    console.log('  expiresAt:', campaign?.expiresAt?.toDate())
    console.log('  lastPaymentAt:', campaign?.lastPaymentAt?.toDate())
    
    // Get payments for this campaign
    const paymentsSnapshot = await db.collection('payments')
      .where('campaignId', '==', campaignId)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get()
    
    console.log('\n💳 Recent Payments:')
    if (paymentsSnapshot.empty) {
      console.log('  No payments found for this campaign')
    } else {
      paymentsSnapshot.docs.forEach((doc, index) => {
        const payment = doc.data()
        console.log(`\n  Payment ${index + 1}:`)
        console.log('    ID:', doc.id)
        console.log('    Order ID:', payment.orderId)
        console.log('    Status:', payment.status)
        console.log('    Amount:', payment.amount)
        console.log('    Plan Type:', payment.planType)
        console.log('    Created At:', payment.createdAt?.toDate())
        console.log('    Completed At:', payment.completedAt?.toDate())
        console.log('    Webhook Received:', payment.webhookReceivedAt?.toDate())
        console.log('    Cashfree Payment ID:', payment.cashfreePaymentId)
        if (payment.webhookData) {
          console.log('    Webhook Data:', JSON.stringify(payment.webhookData, null, 2))
        }
      })
    }
    
    // Get recent logs related to this campaign
    const logsSnapshot = await db.collection('logs')
      .where('metadata.campaignId', '==', campaignId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()
    
    console.log('\n📝 Recent Logs:')
    if (logsSnapshot.empty) {
      console.log('  No logs found for this campaign')
    } else {
      logsSnapshot.docs.forEach((doc, index) => {
        const log = doc.data()
        console.log(`\n  Log ${index + 1}:`)
        console.log('    Event Type:', log.eventType)
        console.log('    Description:', log.description)
        console.log('    Created At:', log.createdAt?.toDate())
        console.log('    Metadata:', JSON.stringify(log.metadata, null, 2))
      })
    }
    
    // Check webhook logs
    const webhookLogsSnapshot = await db.collection('logs')
      .where('eventType', 'in', ['webhook_failure', 'payment_success', 'payment_failure'])
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()
    
    console.log('\n🔔 Recent Webhook Logs:')
    if (webhookLogsSnapshot.empty) {
      console.log('  No webhook logs found')
      console.log('  ⚠️  This might indicate webhooks are not being received!')
    } else {
      webhookLogsSnapshot.docs.forEach((doc, index) => {
        const log = doc.data()
        console.log(`\n  Webhook Log ${index + 1}:`)
        console.log('    Event Type:', log.eventType)
        console.log('    Description:', log.description)
        console.log('    Created At:', log.createdAt?.toDate())
        console.log('    Metadata:', JSON.stringify(log.metadata, null, 2))
      })
    }
    
    console.log('\n=== Analysis ===\n')
    
    if (campaign?.isActive) {
      console.log('✅ Campaign is ACTIVE')
    } else {
      console.log('❌ Campaign is INACTIVE')
      
      if (paymentsSnapshot.empty) {
        console.log('   Reason: No payment records found')
      } else {
        const latestPayment = paymentsSnapshot.docs[0].data()
        if (latestPayment.status === 'pending') {
          console.log('   Reason: Payment is still pending')
          console.log('   Action: Check if webhook was received from Cashfree')
        } else if (latestPayment.status === 'failed') {
          console.log('   Reason: Payment failed')
        } else if (latestPayment.status === 'success') {
          console.log('   Reason: Payment succeeded but campaign not activated')
          console.log('   ⚠️  This is a BUG - webhook handler should have activated the campaign')
          console.log('   Action: Check webhook logs above for errors')
        }
      }
    }
    
    console.log('\n=== Recommendations ===\n')
    console.log('1. Check Cashfree dashboard to see if webhooks are being sent')
    console.log('2. Verify webhook URL is configured: https://phrames.cleffon.com/api/payments/webhook')
    console.log('3. Check if webhooks are being received in the logs above')
    console.log('4. If payment is successful but campaign inactive, you may need to manually activate it')
    console.log('\n')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Get campaign ID from command line
const campaignId = process.argv[2]

if (!campaignId) {
  console.error('Usage: npx ts-node -r tsconfig-paths/register scripts/check-payment-status.ts <campaignId>')
  process.exit(1)
}

checkPaymentStatus(campaignId).then(() => {
  console.log('Done!')
  process.exit(0)
}).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
