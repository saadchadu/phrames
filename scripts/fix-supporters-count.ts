#!/usr/bin/env tsx

/**
 * Script to fix supporter counts across all campaigns
 * 
 * This script will:
 * 1. Recalculate supporter counts based on actual supporter records
 * 2. Clean up orphaned supporter records
 * 3. Generate a report of fixes applied
 * 
 * Usage:
 * npm run fix-supporters
 * 
 * Or with specific campaign:
 * npm run fix-supporters -- --campaign-id=CAMPAIGN_ID
 */

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { fixAllCampaignsSupportersCount, cleanupOrphanedSupporters, recalculateSupportersCount } from '../lib/supporters'

// Initialize Firebase (you may need to adjust this based on your setup)
const firebaseConfig = {
  // Add your Firebase config here
  // This should match your production config
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function main() {
  const args = process.argv.slice(2)
  const campaignIdArg = args.find(arg => arg.startsWith('--campaign-id='))
  const campaignId = campaignIdArg?.split('=')[1]

  console.log('🔧 Starting supporter count fix process...')
  console.log('⏰ Timestamp:', new Date().toISOString())
  
  if (campaignId) {
    console.log(`🎯 Fixing single campaign: ${campaignId}`)
    
    const result = await recalculateSupportersCount(campaignId)
    
    if (result.success) {
      console.log(`✅ Fixed campaign ${campaignId}:`)
      console.log(`   Old count: ${result.oldCount}`)
      console.log(`   New count: ${result.newCount}`)
      console.log(`   Difference: ${(result.newCount || 0) - (result.oldCount || 0)}`)
    } else {
      console.error(`❌ Failed to fix campaign ${campaignId}:`, result.error)
      process.exit(1)
    }
  } else {
    console.log('🔄 Fixing all campaigns...')
    
    // Step 1: Clean up orphaned supporters
    console.log('\n📋 Step 1: Cleaning up orphaned supporter records...')
    const cleanupResult = await cleanupOrphanedSupporters()
    
    if (cleanupResult.success) {
      console.log(`✅ Cleaned up ${cleanupResult.cleaned} orphaned supporter records`)
      if (cleanupResult.errors.length > 0) {
        console.log('⚠️  Cleanup errors:')
        cleanupResult.errors.forEach(error => console.log(`   - ${error}`))
      }
    } else {
      console.error('❌ Failed to clean up orphaned supporters:', cleanupResult.errors)
    }
    
    // Step 2: Fix all campaign supporter counts
    console.log('\n📋 Step 2: Recalculating all campaign supporter counts...')
    const fixResult = await fixAllCampaignsSupportersCount()
    
    if (fixResult.success) {
      console.log(`✅ Fixed ${fixResult.fixed} campaigns`)
      if (fixResult.errors.length > 0) {
        console.log('⚠️  Fix errors:')
        fixResult.errors.forEach(error => console.log(`   - ${error}`))
      }
    } else {
      console.error('❌ Failed to fix campaign supporter counts:', fixResult.errors)
      process.exit(1)
    }
  }
  
  console.log('\n🎉 Supporter count fix process completed!')
  console.log('⏰ Finished at:', new Date().toISOString())
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