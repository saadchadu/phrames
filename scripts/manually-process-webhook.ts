import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { calculateExpiryDate } from '../lib/cashfree'
import * as dotenv from 'dotenv'

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

// Webhook data from your logs
const webhookData = {
  "order": {
    "order_id": "order_1764552605276_cSKG6hbj",
    "order_amount": 1,
    "order_currency": "INR",
    "order_tags": null
  },
  "payment": {
    "cf_payment_id": "4644245764",
    "payment_status": "SUCCESS",
    "payment_amount": 1,
    "payment_currency": "INR",
    "payment_message": "00::Transaction Success",
    "payment_time": "2025-12-01T07:00:11+05:30",
    "bank_reference": "570177833826",
    "auth_id": null,
    "payment_method": {
      "upi": {
        "channel": null,
        "upi_id": "abdullakp3203@naviaxis"
      }
    },
    "payment_group": "upi_credit_card"
  },
  "customer_details": {
    "customer_name": null,
    "customer_id": "o8VA5Fh1h1PtQ1623LTrSlyAsNz1",
    "customer_email": "saadchadu@gmail.com",
    "customer_phone": "9999999999"
  },
  "payment_gateway_details": {
    "gateway_name": "CASHFREE",
    "gateway_order_id": null,
    "gateway_payment_id": null,
    "gateway_status_code": null,
    "gateway_order_reference_id": null,
    "gateway_settlement": "CASHFREE",
    "gateway_reference_name": null
  },
  "payment_offers": null
}

async function processWebhook() {
  console.log('\n=== Manually Processing Webhook ===\n')
  
  const orderId = webhookData.order.order_id
  const paymentId = webhookData.payment.cf_payment_id
  
  console.log('1. Looking up payment record for order:', orderId)
  
  // Get payment record
  const querySnapshot = await db.collection('payments')
    .where('orderId', '==', orderId)
    .limit(1)
    .get()
  
  if (querySnapshot.empty) {
    console.log('❌ Payment record not found')
    return
  }
  
  const paymentDoc = querySnapshot.docs[0]
  const paymentRecord = { id: paymentDoc.id, ...paymentDoc.data() }
  
  console.log('✅ Payment record found:', paymentRecord.id)
  console.log('   - Campaign ID:', paymentRecord.campaignId)
  console.log('   - User ID:', paymentRecord.userId)
  console.log('   - Plan Type:', paymentRecord.planType)
  console.log('   - Amount:', paymentRecord.amount)
  console.log('   - Current Status:', paymentRecord.status)
  
  // Check if already processed
  if (paymentRecord.status === 'success') {
    console.log('\n⚠️  Payment already processed')
    return
  }
  
  const { campaignId, planType, amount, userId } = paymentRecord as any
  
  // Check if user is blocked
  console.log('\n2. Checking if user is blocked...')
  const userDoc = await db.collection('users').doc(userId).get()
  if (userDoc.exists) {
    const userData = userDoc.data()
    if (userData?.isBlocked === true) {
      console.log('❌ User is blocked, cannot activate campaign')
      return
    }
  }
  console.log('✅ User is not blocked')
  
  // Calculate expiry date
  console.log('\n3. Calculating expiry date for plan:', planType)
  const expiryDate = calculateExpiryDate(planType)
  console.log('✅ Expiry date:', expiryDate)
  
  // Update campaign
  console.log('\n4. Activating campaign:', campaignId)
  const campaignRef = db.collection('campaigns').doc(campaignId)
  await campaignRef.update({
    isActive: true,
    status: 'Active',
    isFreeCampaign: false,
    planType,
    amountPaid: amount,
    paymentId: orderId,
    expiresAt: expiryDate ? Timestamp.fromDate(expiryDate) : null,
    lastPaymentAt: Timestamp.now()
  })
  console.log('✅ Campaign activated')
  
  // Update payment record
  console.log('\n5. Updating payment record...')
  const paymentRef = db.collection('payments').doc(paymentRecord.id as string)
  await paymentRef.update({
    status: 'success',
    cashfreePaymentId: paymentId,
    completedAt: Timestamp.now(),
    webhookData: webhookData,
    webhookReceivedAt: Timestamp.now()
  })
  console.log('✅ Payment record updated')
  
  // Create success log
  console.log('\n6. Creating admin log...')
  await db.collection('logs').add({
    eventType: 'payment_success',
    actorId: 'system',
    description: `Payment successful for order ${orderId} - Campaign activated (manually processed)`,
    metadata: {
      orderId,
      userId,
      campaignId,
      amount,
      planType,
      expiresAt: expiryDate ? expiryDate.toISOString() : null,
      cashfreePaymentId: paymentId,
      manuallyProcessed: true
    },
    createdAt: Timestamp.now()
  })
  console.log('✅ Admin log created')
  
  console.log('\n✅ SUCCESS! Campaign has been activated.\n')
}

processWebhook()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
