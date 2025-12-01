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

async function checkPaymentRecord() {
  const paymentRecordId = '6xtqfF9uyihqaQLWCMvA'
  const orderId = 'order_1764552605276_cSKG6hbj'
  
  console.log('\n=== Checking Payment Record ===\n')
  
  // Get payment record by ID
  console.log('1. Getting payment record by ID:', paymentRecordId)
  const paymentDoc = await db.collection('payments').doc(paymentRecordId).get()
  
  if (!paymentDoc.exists) {
    console.log('❌ Payment record not found')
  } else {
    const data = paymentDoc.data()
    console.log('✅ Payment record found:')
    console.log('   - Order ID:', data?.orderId)
    console.log('   - Cashfree Order ID:', data?.cashfreeOrderId)
    console.log('   - Campaign ID:', data?.campaignId)
    console.log('   - User ID:', data?.userId)
    console.log('   - Amount:', data?.amount)
    console.log('   - Status:', data?.status)
    console.log('   - Created At:', data?.createdAt?.toDate())
    console.log('\n   Full data:', JSON.stringify(data, null, 2))
  }
  
  // Try to query by orderId
  console.log('\n2. Querying by orderId:', orderId)
  const querySnapshot = await db.collection('payments')
    .where('orderId', '==', orderId)
    .get()
  
  if (querySnapshot.empty) {
    console.log('❌ No payment found with orderId:', orderId)
  } else {
    console.log(`✅ Found ${querySnapshot.size} payment(s) with orderId`)
    querySnapshot.docs.forEach((doc, index) => {
      console.log(`\n   Payment ${index + 1}:`)
      console.log('   - Doc ID:', doc.id)
      console.log('   - Order ID:', doc.data().orderId)
    })
  }
  
  // List all payments for the campaign
  console.log('\n3. Listing all payments for campaign: cSKG6hbjjBSbcGEpEsHE')
  const campaignPayments = await db.collection('payments')
    .where('campaignId', '==', 'cSKG6hbjjBSbcGEpEsHE')
    .get()
  
  console.log(`Found ${campaignPayments.size} payment(s):`)
  campaignPayments.docs.forEach((doc, index) => {
    const data = doc.data()
    console.log(`\n   Payment ${index + 1}:`)
    console.log('   - Doc ID:', doc.id)
    console.log('   - Order ID:', data.orderId)
    console.log('   - Cashfree Order ID:', data.cashfreeOrderId)
    console.log('   - Status:', data.status)
    console.log('   - Created At:', data.createdAt?.toDate())
  })
}

checkPaymentRecord()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
