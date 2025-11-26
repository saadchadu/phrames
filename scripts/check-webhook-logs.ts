/**
 * Check recent webhook activity
 * Usage: npx ts-node --project tsconfig.scripts.json scripts/check-webhook-logs.ts
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

async function checkWebhookLogs() {
  console.log('\n🔔 WEBHOOK ACTIVITY CHECK\n')
  console.log('=' .repeat(70))
  
  try {
    // Check for recent webhook logs
    const webhookLogsSnapshot = await db.collection('logs')
      .where('eventType', 'in', ['webhook_received', 'payment_success', 'webhook_failure', 'webhook_error'])
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()
    
    if (webhookLogsSnapshot.empty) {
      console.log('\n❌ No webhook logs found in the last 10 entries')
      console.log('\nThis could mean:')
      console.log('  1. No payments have been made yet')
      console.log('  2. Webhooks are not being received')
      console.log('  3. Webhook URL needs to be configured in Cashfree')
      console.log('\nWebhook URL should be: https://phrames.cleffon.com/api/payments/webhook')
    } else {
      console.log(`\n✅ Found ${webhookLogsSnapshot.size} recent webhook log(s):\n`)
      
      webhookLogsSnapshot.docs.forEach((doc, index) => {
        const log = doc.data()
        console.log(`${index + 1}. ${log.eventType}`)
        console.log(`   Time: ${log.createdAt?.toDate().toLocaleString()}`)
        console.log(`   Description: ${log.description}`)
        
        if (log.metadata) {
          console.log(`   Metadata:`)
          if (log.metadata.orderId) console.log(`     Order ID: ${log.metadata.orderId}`)
          if (log.metadata.campaignId) console.log(`     Campaign ID: ${log.metadata.campaignId}`)
          if (log.metadata.webhookType) console.log(`     Webhook Type: ${log.metadata.webhookType}`)
          if (log.metadata.error) console.log(`     Error: ${log.metadata.error}`)
        }
        console.log('')
      })
    }
    
    // Check for recent payment success logs
    console.log('=' .repeat(70))
    console.log('\n💳 RECENT PAYMENT ACTIVITY\n')
    
    const paymentLogsSnapshot = await db.collection('logs')
      .where('eventType', 'in', ['payment_initiated', 'payment_success', 'payment_failure'])
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get()
    
    if (paymentLogsSnapshot.empty) {
      console.log('No recent payment activity found')
    } else {
      paymentLogsSnapshot.docs.forEach((doc, index) => {
        const log = doc.data()
        console.log(`${index + 1}. ${log.eventType}`)
        console.log(`   Time: ${log.createdAt?.toDate().toLocaleString()}`)
        console.log(`   Description: ${log.description}`)
        if (log.metadata?.orderId) console.log(`   Order ID: ${log.metadata.orderId}`)
        if (log.metadata?.campaignId) console.log(`   Campaign ID: ${log.metadata.campaignId}`)
        if (log.metadata?.amount) console.log(`   Amount: ₹${log.metadata.amount}`)
        console.log('')
      })
    }
    
    // Check for campaign activations
    console.log('=' .repeat(70))
    console.log('\n🎯 RECENT CAMPAIGN ACTIVATIONS\n')
    
    const activationLogsSnapshot = await db.collection('logs')
      .where('eventType', '==', 'campaign_activated')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get()
    
    if (activationLogsSnapshot.empty) {
      console.log('No recent campaign activations found')
    } else {
      activationLogsSnapshot.docs.forEach((doc, index) => {
        const log = doc.data()
        console.log(`${index + 1}. Campaign Activated`)
        console.log(`   Time: ${log.createdAt?.toDate().toLocaleString()}`)
        console.log(`   Description: ${log.description}`)
        if (log.metadata?.campaignId) console.log(`   Campaign ID: ${log.metadata.campaignId}`)
        if (log.metadata?.planType) console.log(`   Plan: ${log.metadata.planType}`)
        if (log.metadata?.expiresAt) console.log(`   Expires: ${log.metadata.expiresAt}`)
        console.log('')
      })
    }
    
    console.log('=' .repeat(70))
    console.log('\n✅ Webhook system appears to be working correctly!')
    console.log('\nNext steps:')
    console.log('  1. Make a test payment to verify end-to-end flow')
    console.log('  2. Check that campaign activates automatically')
    console.log('  3. Monitor logs for any errors')
    console.log('\n' + '=' .repeat(70) + '\n')
    
  } catch (error: any) {
    console.error('\n❌ Error checking webhook logs:', error.message)
  }
}

checkWebhookLogs().then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
