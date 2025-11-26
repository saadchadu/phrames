/**
 * Check for order ID mismatches between payments and webhooks
 * Usage: npx ts-node --project tsconfig.scripts.json scripts/check-order-mismatch.ts
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

async function checkOrderMismatch() {
  console.log('\n🔍 CHECKING ORDER ID MISMATCHES\n')
  console.log('=' .repeat(70))
  
  try {
    // Get recent webhook logs with order IDs
    const webhookLogsSnapshot = await db.collection('logs')
      .where('eventType', '==', 'webhook_received')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get()
    
    console.log('\n📋 Recent Webhook Order IDs:\n')
    
    const webhookOrderIds: string[] = []
    webhookLogsSnapshot.docs.forEach((doc, index) => {
      const log = doc.data()
      const orderId = log.metadata?.orderId
      if (orderId) {
        webhookOrderIds.push(orderId)
        console.log(`${index + 1}. ${orderId}`)
        console.log(`   Time: ${log.createdAt?.toDate().toLocaleString()}`)
      }
    })
    
    // Get all payment records
    console.log('\n💳 Payment Records in Database:\n')
    const paymentsSnapshot = await db.collection('payments')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()
    
    paymentsSnapshot.docs.forEach((doc, index) => {
      const payment = doc.data()
      console.log(`${index + 1}. Payment ID: ${doc.id}`)
      console.log(`   orderId: ${payment.orderId}`)
      console.log(`   cashfreeOrderId: ${payment.cashfreeOrderId}`)
      console.log(`   campaignId: ${payment.campaignId}`)
      console.log(`   status: ${payment.status}`)
      console.log(`   created: ${payment.createdAt?.toDate().toLocaleString()}`)
      console.log('')
    })
    
    // Check for mismatches
    console.log('=' .repeat(70))
    console.log('\n🔎 MISMATCH ANALYSIS:\n')
    
    for (const webhookOrderId of webhookOrderIds) {
      console.log(`Checking webhook order: ${webhookOrderId}`)
      
      // Try to find matching payment
      const matchingPayments = paymentsSnapshot.docs.filter(doc => {
        const payment = doc.data()
        return payment.orderId === webhookOrderId || payment.cashfreeOrderId === webhookOrderId
      })
      
      if (matchingPayments.length === 0) {
        console.log(`  ❌ NO MATCHING PAYMENT FOUND`)
        console.log(`     This webhook order ID doesn't match any payment record!`)
        console.log(`     Possible causes:`)
        console.log(`     1. Payment record was never created`)
        console.log(`     2. Order ID format mismatch`)
        console.log(`     3. Payment was deleted`)
      } else {
        console.log(`  ✅ Found ${matchingPayments.length} matching payment(s)`)
        matchingPayments.forEach(doc => {
          const payment = doc.data()
          console.log(`     Payment ID: ${doc.id}`)
          console.log(`     Status: ${payment.status}`)
        })
      }
      console.log('')
    }
    
    console.log('=' .repeat(70) + '\n')
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    console.error(error)
  }
}

checkOrderMismatch().then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
