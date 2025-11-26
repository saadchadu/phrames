/**
 * Check webhook payload details
 * Usage: npx ts-node --project tsconfig.scripts.json scripts/check-webhook-payload.ts
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

async function checkWebhookPayload() {
  console.log('\n🔍 WEBHOOK PAYLOAD ANALYSIS\n')
  console.log('=' .repeat(70))
  
  try {
    // Get the most recent webhook_received log
    const webhookLogsSnapshot = await db.collection('logs')
      .where('eventType', '==', 'webhook_received')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get()
    
    if (webhookLogsSnapshot.empty) {
      console.log('\n❌ No webhook logs found')
      return
    }
    
    const log = webhookLogsSnapshot.docs[0].data()
    console.log('\n📦 Most Recent Webhook Payload:\n')
    console.log('Time:', log.createdAt?.toDate().toLocaleString())
    console.log('Description:', log.description)
    console.log('\nFull Payload:')
    console.log(JSON.stringify(log.metadata?.fullPayload, null, 2))
    
    console.log('\n' + '=' .repeat(70))
    console.log('\n🔎 PAYLOAD STRUCTURE ANALYSIS:\n')
    
    const payload = log.metadata?.fullPayload
    if (payload) {
      console.log('Webhook Type:', payload.type)
      console.log('Has data object:', !!payload.data)
      console.log('Has data.order:', !!payload.data?.order)
      console.log('Has data.payment:', !!payload.data?.payment)
      
      if (payload.data?.order) {
        console.log('\nOrder Details:')
        console.log('  order_id:', payload.data.order.order_id)
        console.log('  order_amount:', payload.data.order.order_amount)
        console.log('  order_currency:', payload.data.order.order_currency)
      }
      
      if (payload.data?.payment) {
        console.log('\nPayment Details:')
        console.log('  cf_payment_id:', payload.data.payment.cf_payment_id)
        console.log('  payment_status:', payload.data.payment.payment_status)
        console.log('  payment_amount:', payload.data.payment.payment_amount)
        console.log('  payment_time:', payload.data.payment.payment_time)
        console.log('  payment_method:', payload.data.payment.payment_method?.payment_method)
      }
    }
    
    console.log('\n' + '=' .repeat(70) + '\n')
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    console.error(error)
  }
}

checkWebhookPayload().then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
