import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
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

async function checkWebhookActivation() {
  const orderId = 'order_1764552605276_cSKG6hbj'
  const campaignId = 'cSKG6hbjjBSbcGEpEsHE'
  
  console.log('\n=== Checking Webhook Activation ===\n')
  
  // Check payment record
  console.log('1. Checking payment record...')
  const paymentsSnapshot = await db.collection('payments')
    .where('orderId', '==', orderId)
    .get()
  
  if (paymentsSnapshot.empty) {
    console.log('❌ No payment record found for order:', orderId)
  } else {
    const paymentDoc = paymentsSnapshot.docs[0]
    const paymentData = paymentDoc.data()
    console.log('✅ Payment record found:')
    console.log('   - Status:', paymentData.status)
    console.log('   - Campaign ID:', paymentData.campaignId)
    console.log('   - User ID:', paymentData.userId)
    console.log('   - Amount:', paymentData.amount)
    console.log('   - Plan Type:', paymentData.planType)
    console.log('   - Webhook Data:', paymentData.webhookData ? 'Present' : 'Missing')
    console.log('   - Webhook Received At:', paymentData.webhookReceivedAt?.toDate())
  }
  
  // Check campaign status
  console.log('\n2. Checking campaign status...')
  const campaignDoc = await db.collection('campaigns').doc(campaignId).get()
  
  if (!campaignDoc.exists) {
    console.log('❌ Campaign not found:', campaignId)
  } else {
    const campaignData = campaignDoc.data()
    console.log('✅ Campaign found:')
    console.log('   - Name:', campaignData?.campaignName)
    console.log('   - Is Active:', campaignData?.isActive)
    console.log('   - Status:', campaignData?.status)
    console.log('   - Plan Type:', campaignData?.planType)
    console.log('   - Amount Paid:', campaignData?.amountPaid)
    console.log('   - Payment ID:', campaignData?.paymentId)
    console.log('   - Expires At:', campaignData?.expiresAt?.toDate())
    console.log('   - Last Payment At:', campaignData?.lastPaymentAt?.toDate())
  }
  
  // Check webhook logs
  console.log('\n3. Checking webhook logs...')
  try {
    const logsSnapshot = await db.collection('logs')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()
    
    const relevantLogs = logsSnapshot.docs.filter(doc => {
      const data = doc.data()
      return data.metadata?.orderId === orderId || 
             data.description?.includes(orderId) ||
             data.description?.includes(campaignId)
    })
    
    if (relevantLogs.length === 0) {
      console.log('❌ No webhook logs found for order:', orderId)
    } else {
      console.log(`✅ Found ${relevantLogs.length} log entries:`)
      relevantLogs.forEach((doc, index) => {
        const logData = doc.data()
        console.log(`\n   Log ${index + 1}:`)
        console.log('   - Event Type:', logData.eventType)
        console.log('   - Description:', logData.description)
        console.log('   - Created At:', logData.createdAt?.toDate())
        if (logData.metadata) {
          console.log('   - Metadata:', JSON.stringify(logData.metadata, null, 2))
        }
      })
    }
  } catch (error: any) {
    console.log('⚠️  Could not query logs (index may be needed):', error.message)
  }
  
  console.log('\n=== Analysis ===\n')
  
  if (paymentsSnapshot.empty) {
    console.log('❌ ISSUE: Payment record not found. The payment was not created properly.')
  } else if (!campaignDoc.exists) {
    console.log('❌ ISSUE: Campaign not found. The campaign ID in payment record is incorrect.')
  } else {
    const paymentData = paymentsSnapshot.docs[0].data()
    const campaignData = campaignDoc.data()
    
    if (paymentData.status !== 'success') {
      console.log('❌ ISSUE: Payment status is not "success". Current status:', paymentData.status)
    }
    
    if (!campaignData?.isActive) {
      console.log('❌ ISSUE: Campaign is not active. The webhook handler did not activate it.')
      
      if (!paymentData.webhookData) {
        console.log('   Reason: Webhook data not received by the payment record.')
      } else {
        console.log('   Reason: Webhook was received but campaign activation failed.')
      }
    } else {
      console.log('✅ SUCCESS: Campaign is active and payment is successful!')
    }
  }
  
  console.log('\n')
}

checkWebhookActivation()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
