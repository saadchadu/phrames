#!/usr/bin/env tsx

/**
 * Script to check for campaigns that should be active but aren't
 * This helps identify campaigns where payment succeeded but webhook failed
 */

import { config } from 'dotenv'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'

// Load environment variables
config({ path: '.env.local' })

// Initialize Firebase using environment variables
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

if (!firebaseConfig.projectId) {
  console.error('❌ Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable')
  console.error('Make sure .env.local exists and contains the Firebase configuration')
  process.exit(1)
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function main() {
  console.log('🔍 Checking for stuck campaigns...')
  console.log('⏰ Timestamp:', new Date().toISOString())
  
  try {
    // Get all inactive campaigns
    const inactiveCampaignsQuery = query(
      collection(db, 'campaigns'),
      where('isActive', '==', false)
    )
    const inactiveCampaigns = await getDocs(inactiveCampaignsQuery)
    
    console.log(`📊 Found ${inactiveCampaigns.size} inactive campaigns`)
    
    let stuckCount = 0
    const stuckCampaigns = []
    
    for (const campaignDoc of inactiveCampaigns.docs) {
      const campaign = campaignDoc.data()
      const campaignId = campaignDoc.id
      
      // Check if there are successful payments for this campaign
      const successfulPaymentsQuery = query(
        collection(db, 'payments'),
        where('campaignId', '==', campaignId),
        where('status', '==', 'success')
      )
      const successfulPayments = await getDocs(successfulPaymentsQuery)
      
      if (!successfulPayments.empty) {
        stuckCount++
        const payment = successfulPayments.docs[0].data()
        stuckCampaigns.push({
          campaignId,
          campaignName: campaign.campaignName,
          createdBy: campaign.createdBy,
          paymentId: payment.orderId,
          amount: payment.amount,
          planType: payment.planType,
          paymentDate: payment.completedAt?.toDate?.() || 'Unknown'
        })
        
        console.log(`🚨 Stuck campaign found:`)
        console.log(`   ID: ${campaignId}`)
        console.log(`   Name: ${campaign.campaignName}`)
        console.log(`   Payment: ${payment.orderId} (${payment.amount} INR)`)
        console.log(`   Plan: ${payment.planType}`)
        console.log(`   Date: ${payment.completedAt?.toDate?.() || 'Unknown'}`)
        console.log('')
      }
    }
    
    if (stuckCount === 0) {
      console.log('✅ No stuck campaigns found! All campaigns with successful payments are active.')
    } else {
      console.log(`❌ Found ${stuckCount} stuck campaigns that should be activated`)
      console.log('\n💡 To fix these campaigns, you can:')
      console.log('1. Use the admin panel: Settings > Supporters Management > Fix All')
      console.log('2. Run: npm run manually-activate-campaign -- --campaign-id=CAMPAIGN_ID --order-id=ORDER_ID')
      console.log('3. Run: npm run fix-stuck-campaigns')
    }
    
  } catch (error) {
    console.error('❌ Error checking campaigns:', error)
    process.exit(1)
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error)
  process.exit(1)
})

// Run the script
main().catch((error) => {
  console.error('❌ Script failed:', error)
  process.exit(1)
})