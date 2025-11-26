/**
 * Check if payments collection exists and has any documents
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

async function checkPayments() {
  console.log('\n=== Checking Payments Collection ===\n')
  
  try {
    const paymentsSnapshot = await db.collection('payments')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()
    
    console.log('Total payments found:', paymentsSnapshot.size)
    
    if (paymentsSnapshot.empty) {
      console.log('\n❌ No payments found in database')
      console.log('This means payment records are not being created.')
    } else {
      console.log('\n✅ Payments exist in database:\n')
      paymentsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data()
        console.log(`Payment ${index + 1}:`)
        console.log('  ID:', doc.id)
        console.log('  Order ID:', data.orderId)
        console.log('  Cashfree Order ID:', data.cashfreeOrderId)
        console.log('  Campaign ID:', data.campaignId)
        console.log('  User ID:', data.userId)
        console.log('  Amount:', data.amount)
        console.log('  Status:', data.status)
        console.log('  Plan Type:', data.planType)
        console.log('  Created At:', data.createdAt?.toDate())
        console.log('')
      })
    }
    
    // Check if collection exists but has no documents
    const collectionRef = db.collection('payments')
    console.log('Collection reference:', collectionRef.path)
    
  } catch (error: any) {
    console.error('Error:', error.message)
    if (error.code === 9) {
      console.log('\n⚠️  Error code 9: Missing index')
      console.log('This might mean the collection needs an index.')
      console.log('Try querying without orderBy...\n')
      
      const snapshot = await db.collection('payments').limit(10).get()
      console.log('Payments without orderBy:', snapshot.size)
      
      if (!snapshot.empty) {
        snapshot.docs.forEach((doc, index) => {
          const data = doc.data()
          console.log(`Payment ${index + 1}:`, {
            id: doc.id,
            orderId: data.orderId,
            status: data.status,
            amount: data.amount
          })
        })
      }
    }
  }
}

checkPayments().then(() => {
  console.log('\nDone!')
  process.exit(0)
}).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
