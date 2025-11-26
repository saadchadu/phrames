/**
 * Comprehensive payment diagnostic script
 * Usage: npx ts-node -r tsconfig-paths/register scripts/diagnose-payment-issue.ts <campaignId>
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

async function diagnosePaymentIssue(campaignId: string) {
  console.log('\n🔍 PAYMENT ACTIVATION DIAGNOSTIC TOOL\n')
  console.log('=' .repeat(60))
  console.log(`Campaign ID: ${campaignId}`)
  console.log('=' .repeat(60))
  
  try {
    // 1. Check Campaign Status
    console.log('\n📋 STEP 1: Campaign Status')
    console.log('-'.repeat(60))
    const campaignDoc = await db.collection('campaigns').doc(campaignId).get()
    
    if (!campaignDoc.exists) {
      console.log('❌ Campaign not found!')
      return
    }
    
    const campaign = campaignDoc.data()!
    console.log(`Name: ${campaign.campaignName}`)
    console.log(`Active: ${campaign.isActive ? '✅ YES' : '❌ NO'}`)
    console.log(`Status: ${campaign.status}`)
    console.log(`Free Campaign: ${campaign.isFreeCampaign ? 'Yes' : 'No'}`)
    console.log(`Plan Type: ${campaign.planType || 'Not set'}`)
    console.log(`Amount Paid: ₹${campaign.amountPaid || 0}`)
    console.log(`Payment ID: ${campaign.paymentId || 'Not set'}`)
    console.log(`Expires At: ${campaign.expiresAt ? campaign.expiresAt.toDate().toLocaleString() : 'Not set'}`)
    console.log(`Last Payment: ${campaign.lastPaymentAt ? campaign.lastPaymentAt.toDate().toLocaleString() : 'Never'}`)
    
    // 2. Check Payment Records
    console.log('\n💳 STEP 2: Payment Records')
    console.log('-'.repeat(60))
    const paymentsSnapshot = await db.collection('payments')
      .where('campaignId', '==', campaignId)
      .orderBy('createdAt', 'desc')
      .get()
    
    if (paymentsSnapshot.empty) {
      console.log('❌ No payment records found')
      console.log('\n⚠️  ISSUE: No payment was initiated for this campaign')
      console.log('   ACTION: User needs to initiate payment from dashboard')
      return
    }
    
    console.log(`Found ${paymentsSnapshot.size} payment record(s):\n`)
    
    let hasSuccessfulPayment = false
    let latestPayment: any = null
    
    paymentsSnapshot.docs.forEach((doc, index) => {
      const payment = doc.data()
      if (index === 0) latestPayment = { id: doc.id, ...payment }
      
      console.log(`Payment #${index + 1}:`)
      console.log(`  ID: ${doc.id}`)
      console.log(`  Order ID: ${payment.orderId}`)
      console.log(`  Cashfree Order ID: ${payment.cashfreeOrderId || 'Not set'}`)
      console.log(`  Status: ${payment.status}`)
      console.log(`  Amount: ₹${payment.amount}`)
      console.log(`  Plan: ${payment.planType}`)
      console.log(`  Created: ${payment.createdAt?.toDate().toLocaleString()}`)
      console.log(`  Completed: ${payment.completedAt ? payment.completedAt.toDate().toLocaleString() : 'Not completed'}`)
      console.log(`  Webhook Received: ${payment.webhookReceivedAt ? payment.webhookReceivedAt.toDate().toLocaleString() : '❌ NO'}`)
      console.log(`  Cashfree Payment ID: ${payment.cashfreePaymentId || 'Not set'}`)
      console.log('')
      
      if (payment.status === 'success') {
        hasSuccessfulPayment = true
      }
    })
    
    // 3. Check Webhook Logs
    console.log('\n🔔 STEP 3: Webhook Activity')
    console.log('-'.repeat(60))
    
    // Check for webhook logs related to this campaign
    const webhookLogsSnapshot = await db.collection('logs')
      .where('eventType', 'in', ['webhook_received', 'payment_success', 'payment_failure', 'webhook_failure', 'webhook_error'])
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get()
    
    const relevantWebhooks = webhookLogsSnapshot.docs.filter(doc => {
      const log = doc.data()
      return log.metadata?.campaignId === campaignId || 
             log.metadata?.orderId === latestPayment?.orderId
    })
    
    if (relevantWebhooks.length === 0) {
      console.log('❌ No webhook logs found for this campaign')
      console.log('\n⚠️  CRITICAL ISSUE: Webhooks are not being received!')
      console.log('\n   Possible causes:')
      console.log('   1. Webhook URL not configured in Cashfree dashboard')
      console.log('   2. Webhook URL is incorrect')
      console.log('   3. Cashfree is not sending webhooks')
      console.log('   4. Firewall/security blocking webhook requests')
    } else {
      console.log(`Found ${relevantWebhooks.length} webhook log(s):\n`)
      
      relevantWebhooks.forEach((doc, index) => {
        const log = doc.data()
        console.log(`Webhook #${index + 1}:`)
        console.log(`  Event: ${log.eventType}`)
        console.log(`  Description: ${log.description}`)
        console.log(`  Time: ${log.createdAt?.toDate().toLocaleString()}`)
        if (log.metadata) {
          console.log(`  Metadata:`, JSON.stringify(log.metadata, null, 4))
        }
        console.log('')
      })
    }
    
    // 4. Check All Recent Webhook Logs (to see if ANY webhooks are coming through)
    console.log('\n🌐 STEP 4: Recent Webhook Activity (All Campaigns)')
    console.log('-'.repeat(60))
    
    const allWebhooksSnapshot = await db.collection('logs')
      .where('eventType', '==', 'webhook_received')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get()
    
    if (allWebhooksSnapshot.empty) {
      console.log('❌ No webhooks received recently (last 5)')
      console.log('\n⚠️  CRITICAL: Webhook system is not working!')
    } else {
      console.log(`Last ${allWebhooksSnapshot.size} webhooks received:\n`)
      allWebhooksSnapshot.docs.forEach((doc, index) => {
        const log = doc.data()
        console.log(`  ${index + 1}. ${log.createdAt?.toDate().toLocaleString()} - ${log.description}`)
      })
    }
    
    // 5. Diagnosis Summary
    console.log('\n📊 DIAGNOSIS SUMMARY')
    console.log('=' .repeat(60))
    
    if (campaign.isActive) {
      console.log('✅ Campaign is ACTIVE - No issues detected')
    } else if (!hasSuccessfulPayment) {
      console.log('❌ ISSUE: No successful payment found')
      console.log('\n   Status: Payment is still pending or failed')
      console.log('   Next Steps:')
      console.log('   1. Check Cashfree dashboard for payment status')
      console.log('   2. Verify payment was completed by user')
      console.log('   3. Check if payment gateway returned success')
    } else if (hasSuccessfulPayment && !campaign.isActive) {
      console.log('❌ CRITICAL ISSUE: Payment succeeded but campaign NOT activated')
      console.log('\n   This indicates a webhook processing failure!')
      console.log('\n   Possible causes:')
      console.log('   1. Webhook was never received from Cashfree')
      console.log('   2. Webhook was received but processing failed')
      console.log('   3. Campaign activation logic has a bug')
      
      if (relevantWebhooks.length === 0) {
        console.log('\n   Most likely: Webhook was NEVER received')
        console.log('\n   ACTION REQUIRED:')
        console.log('   1. Check Cashfree dashboard webhook configuration')
        console.log('   2. Verify webhook URL: https://phrames.cleffon.com/api/payments/webhook')
        console.log('   3. Check Cashfree webhook logs to see if they sent it')
        console.log('   4. Manually activate campaign using:')
        console.log(`      npx ts-node -r tsconfig-paths/register scripts/manually-activate-campaign.ts ${campaignId}`)
      } else {
        console.log('\n   Webhook was received but activation failed')
        console.log('\n   ACTION REQUIRED:')
        console.log('   1. Check webhook logs above for error details')
        console.log('   2. Fix the underlying issue')
        console.log('   3. Manually activate campaign using:')
        console.log(`      npx ts-node -r tsconfig-paths/register scripts/manually-activate-campaign.ts ${campaignId}`)
      }
    }
    
    // 6. Configuration Check
    console.log('\n⚙️  STEP 5: Configuration Check')
    console.log('-'.repeat(60))
    console.log(`Cashfree Environment: ${process.env.CASHFREE_ENV || 'Not set'}`)
    console.log(`Cashfree Client ID: ${process.env.CASHFREE_CLIENT_ID ? '✅ Set' : '❌ Not set'}`)
    console.log(`Cashfree Client Secret: ${process.env.CASHFREE_CLIENT_SECRET ? '✅ Set' : '❌ Not set'}`)
    console.log(`App URL: ${process.env.NEXT_PUBLIC_APP_URL || 'Not set'}`)
    console.log(`\nExpected Webhook URL: ${process.env.NEXT_PUBLIC_APP_URL || 'https://phrames.cleffon.com'}/api/payments/webhook`)
    
    console.log('\n' + '='.repeat(60))
    console.log('Diagnostic complete!')
    console.log('='.repeat(60) + '\n')
    
  } catch (error: any) {
    console.error('\n❌ Error running diagnostic:', error.message)
    console.error(error)
  }
}

const campaignId = process.argv[2]

if (!campaignId) {
  console.error('Usage: npx ts-node -r tsconfig-paths/register scripts/diagnose-payment-issue.ts <campaignId>')
  process.exit(1)
}

diagnosePaymentIssue(campaignId).then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
