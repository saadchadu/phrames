/**
 * Manual Trigger Script for Campaign Expiry Check
 * 
 * This script allows you to manually trigger the expiry check logic
 * to test the system without waiting for the scheduled Cloud Function.
 * 
 * Usage:
 *   npx tsx tests/trigger-expiry-check.ts
 * 
 * Requirements:
 *   - Firebase Admin SDK credentials configured
 *   - GOOGLE_APPLICATION_CREDENTIALS environment variable set
 *   - Or running in an environment with default credentials
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

// Initialize Firebase Admin
if (!getApps().length) {
  try {
    initializeApp()
    console.log('✓ Firebase Admin initialized')
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin')
    console.error('Make sure GOOGLE_APPLICATION_CREDENTIALS is set or you have default credentials')
    console.error('Error:', error)
    process.exit(1)
  }
}

const db = getFirestore()

/**
 * Main expiry check function (same logic as Cloud Function)
 */
async function runExpiryCheck() {
  console.log('\n╔════════════════════════════════════════════════════════╗')
  console.log('║     Manual Campaign Expiry Check                      ║')
  console.log('╚════════════════════════════════════════════════════════╝\n')
  
  const now = Timestamp.now()
  const batchId = `manual_${Date.now()}`
  
  try {
    console.log('⏳ Starting campaign expiry check...')
    console.log(`   Current time: ${now.toDate().toISOString()}`)
    console.log(`   Batch ID: ${batchId}\n`)
    
    // Query expired campaigns
    console.log('🔍 Querying expired campaigns...')
    const expiredCampaigns = await db.collection('campaigns')
      .where('isActive', '==', true)
      .where('expiresAt', '<', now)
      .get()
    
    console.log(`   Found ${expiredCampaigns.size} expired campaigns\n`)
    
    if (expiredCampaigns.empty) {
      console.log('✓ No expired campaigns to process')
      console.log('\nTo test the expiry system, create a campaign with:')
      console.log('  - isActive: true')
      console.log('  - expiresAt: [timestamp in the past]')
      return
    }
    
    // Display campaigns to be processed
    console.log('📋 Campaigns to be deactivated:')
    expiredCampaigns.forEach((doc, index) => {
      const campaign = doc.data()
      const expiredDate = campaign.expiresAt?.toDate()
      const daysAgo = Math.floor((now.toMillis() - campaign.expiresAt?.toMillis()) / (24 * 60 * 60 * 1000))
      console.log(`   ${index + 1}. ${campaign.campaignName || 'Unnamed'}`)
      console.log(`      ID: ${doc.id}`)
      console.log(`      Expired: ${expiredDate?.toISOString()} (${daysAgo} days ago)`)
      console.log(`      Plan: ${campaign.planType || 'unknown'}`)
    })
    console.log()
    
    // Process campaigns
    console.log('⚙️  Processing campaigns...')
    let batch = db.batch()
    let count = 0
    let batchCount = 0
    
    for (const doc of expiredCampaigns.docs) {
      const campaign = doc.data()
      
      // Update campaign
      batch.update(doc.ref, {
        isActive: false,
        status: 'Inactive'
      })
      
        /
/ Create expiry log
      const logRef = db.collection('expiryLogs').doc()
      batch.set(logRef, {
        campaignId: doc.id,
        campaignName: campaign.campaignName || 'Unknown',
        userId: campaign.createdBy,
        expiredAt: campaign.expiresAt,
        planType: campaign.planType || 'unknown',
        processedAt: now,
        batchId
      })
      
      count++
      batchCount++
      
      // Commit batch every 250 operations
      if (batchCount >= 250) {
        await batch.commit()
        console.log(`   ✓ Committed batch of ${batchCount} campaigns`)
        batch = db.batch()
        batchCount = 0
      }
    }
    
    // Commit remaining operations
    if (batchCount > 0) {
      await batch.commit()
      console.log(`   ✓ Committed final batch of ${batchCount} campaigns`)
    }
    
    console.log(`\n✅ Successfully processed ${count} expired campaigns`)
    
    // Create batch summary log
    await db.collection('expiryLogs').doc(batchId).set({
      type: 'batch_summary',
      batchId,
      totalProcessed: count,
      processedAt: now,
      timestamp: now,
      manualTrigger: true
    })
    
    console.log(`✓ Created batch summary log: ${batchId}`)
    
    // Display verification steps
    console.log('\n📊 Verification Steps:')
    console.log('   1. Check Firestore campaigns collection:')
    console.log('      - Verify campaigns have isActive: false')
    console.log('      - Verify campaigns have status: "Inactive"')
    console.log('   2. Check Firestore expiryLogs collection:')
    console.log(`      - Look for logs with batchId: ${batchId}`)
    console.log('      - Verify each campaign has a corresponding log')
    console.log('   3. Try accessing expired campaigns via public URL:')
    console.log('      - Should show "This campaign is inactive" message')
    
  } catch (error) {
    console.error('\n❌ Error in expiry check:', error)
    
    // Log error
    try {
      await db.collection('expiryLogs').add({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        batchId,
        processedAt: now,
        manualTrigger: true
      })
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
    
    throw error
  }
}

/**
 * Create test campaigns for testing
 */
async function createTestCampaigns() {
  console.log('\n╔════════════════════════════════════════════════════════╗')
  console.log('║     Create Test Campaigns                             ║')
  console.log('╚════════════════════════════════════════════════════════╝\n')
  
  const now = Timestamp.now()
  const testUserId = `test_user_${Date.now()}`
  
  try {
    // Create expired campaign
    const expiredCampaign = await db.collection('campaigns').add({
      campaignName: 'Test Campaign - Expired',
      slug: `test-expired-${Date.now()}`,
      createdBy: testUserId,
      isActive: true,
      status: 'Active',
      planType: 'week',
      expiresAt: Timestamp.fromMillis(now.toMillis() - 24 * 60 * 60 * 1000), // 1 day ago
      createdAt: now,
      visibility: 'Public',
      frameURL: 'https://example.com/frame.jpg',
      supportersCount: 0
    })
    
    console.log('✓ Created expired test campaign:')
    console.log(`  ID: ${expiredCampaign.id}`)
    console.log(`  Name: Test Campaign - Expired`)
    console.log(`  Expired: 1 day ago`)
    
    // Create active campaign
    const activeCampaign = await db.collection('campaigns').add({
      campaignName: 'Test Campaign - Active',
      slug: `test-active-${Date.now()}`,
      createdBy: testUserId,
      isActive: true,
      status: 'Active',
      planType: 'month',
      expiresAt: Timestamp.fromMillis(now.toMillis() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      createdAt: now,
      visibility: 'Public',
      frameURL: 'https://example.com/frame.jpg',
      supportersCount: 0
    })
    
    console.log('\n✓ Created active test campaign:')
    console.log(`  ID: ${activeCampaign.id}`)
    console.log(`  Name: Test Campaign - Active`)
    console.log(`  Expires: 5 days from now`)
    
    console.log('\n✅ Test campaigns created successfully')
    console.log('\nRun the expiry check to process the expired campaign:')
    console.log('  npx tsx tests/trigger-expiry-check.ts')
    
  } catch (error) {
    console.error('❌ Error creating test campaigns:', error)
    throw error
  }
}

/**
 * Clean up test campaigns
 */
async function cleanupTestCampaigns() {
  console.log('\n╔════════════════════════════════════════════════════════╗')
  console.log('║     Clean Up Test Campaigns                           ║')
  console.log('╚════════════════════════════════════════════════════════╝\n')
  
  try {
    // Delete test campaigns
    const testCampaigns = await db.collection('campaigns')
      .where('slug', '>=', 'test-')
      .where('slug', '<', 'test-\uf8ff')
      .get()
    
    if (testCampaigns.empty) {
      console.log('No test campaigns found')
      return
    }
    
    console.log(`Found ${testCampaigns.size} test campaigns to delete`)
    
    const batch = db.batch()
    testCampaigns.forEach(doc => {
      batch.delete(doc.ref)
      console.log(`  - Deleting: ${doc.data().campaignName} (${doc.id})`)
    })
    await batch.commit()
    
    console.log(`\n✓ Deleted ${testCampaigns.size} test campaigns`)
    
    // Delete test logs
    const testLogs = await db.collection('expiryLogs')
      .where('batchId', '>=', 'manual_')
      .where('batchId', '<', 'manual_\uf8ff')
      .get()
    
    if (!testLogs.empty) {
      const logBatch = db.batch()
      testLogs.forEach(doc => logBatch.delete(doc.ref))
      await logBatch.commit()
      console.log(`✓ Deleted ${testLogs.size} test logs`)
    }
    
    console.log('\n✅ Cleanup completed')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  try {
    switch (command) {
      case 'create':
        await createTestCampaigns()
        break
      case 'cleanup':
        await cleanupTestCampaigns()
        break
      case 'run':
      default:
        await runExpiryCheck()
        break
    }
    
    console.log('\n✅ Operation completed successfully\n')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Operation failed\n')
    process.exit(1)
  }
}

// Show usage if --help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Campaign Expiry Check - Manual Trigger Script

Usage:
  npx tsx tests/trigger-expiry-check.ts [command]

Commands:
  run      Run the expiry check (default)
  create   Create test campaigns for testing
  cleanup  Delete all test campaigns and logs

Examples:
  npx tsx tests/trigger-expiry-check.ts
  npx tsx tests/trigger-expiry-check.ts create
  npx tsx tests/trigger-expiry-check.ts cleanup

Environment:
  Requires GOOGLE_APPLICATION_CREDENTIALS to be set or default credentials available.
  `)
  process.exit(0)
}

// Run main function
main()
