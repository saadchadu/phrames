/**
 * Check a specific payment record by campaign ID
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
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

async function checkPayment(campaignId: string) {
  console.log('\n=== Checking Payment for Campaign ===\n')
  console.log('Campaign ID:', campaignId)
  
  try {
    // Find payment by campaign ID
    const paymentsSnapshot = await db.collection('payments')
      .where('campaignId', '==', campaignId)
      .get()
    
    if (paymentsSnapshot.empty) {
      console.log('\n❌ No payment found for this campaign')
      return
    }
    
    console.log(`\n✅ Found ${paymentsSnapshot.size} payment(s):\n`)
    
    paymentsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data()
      console.log(`Payment ${index + 1}:`)
      console.log('  Document ID:', doc.id)
      console.log('  Order ID:', data.orderId)
      console.log('  Cashfree Order ID:', data.cashfreeOrderId)
      console.log('  Status:', data.status)
      console.log('  Amount:', data.amount)
      console.log('  Plan Type:', data.planType)
      console.log('  User ID:', data.userId)
      console.log('  Created At:', data.createdAt?.toDate())
      console.log('')
    })
    
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const campaignId = process.argv[2] || 'EMjwUjJWru0sQxNQgLbR'

checkPayment(campaignId).then(() => {
  console.log('Done!')
  process.exit(0)
}).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
