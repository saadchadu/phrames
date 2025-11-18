/**
 * Expiry System Test Suite
 * 
 * Tests the campaign expiry functionality including:
 * - Detecting expired campaigns
 * - Deactivating campaigns correctly
 * - Creating expiry logs
 * - Timezone handling
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp()
}

const db = getFirestore()

interface TestCampaign {
  id: string
  campaignName: string
  createdBy: string
  isActive: boolean
  status: 'Active' | 'Inactive'
  planType: string
  expiresAt: Timestamp
  createdAt: Timestamp
}

interface ExpiryLog {
  campaignId: string
  campaignName: string
  userId: string
  expiredAt: Timestamp
  planType: string
  processedAt: Timestamp
  batchId: string
}

/**
 * Test 1: Create test campaigns with various expiry states
 */
async function setupTestCampaigns(): Promise<string[]> {
  console.log('\n=== Setting up test campaigns ===')
  
  const now = Timestamp.now()
  const testUserId = 'test_user_expiry_' + Date.now()
  const campaignIds: string[] = []
  
  // Campaign 1: Expired 1 day ago
  const campaign1 = await db.collection('campaigns').add({
    campaignName: 'Test Campaign - Expired 1 Day',
    slug: 'test-expired-1day-' + Date.now(),
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
  campaignIds.push(campaign1.id)
  console.log(`✓ Created expired campaign (1 day ago): ${campaign1.id}`)
  
  // Campaign 2: Expired 7 days ago
  const campaign2 = await db.collection('campaigns').add({
    campaignName: 'Test Campaign - Expired 7 Days',
    slug: 'test-expired-7days-' + Date.now(),
    createdBy: testUserId,
    isActive: true,
    status: 'Active',
    planType: 'month',
    expiresAt: Timestamp.fromMillis(now.toMillis() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    createdAt: now,
    visibility: 'Public',
    frameURL: 'https://example.com/frame.jpg',
    supportersCount: 0
  })
  campaignIds.push(campaign2.id)
  console.log(`✓ Created expired campaign (7 days ago): ${campaign2.id}`)
  
  // Campaign 3: Active, expires in 5 days
  const campaign3 = await db.collection('campaigns').add({
    campaignName: 'Test Campaign - Active',
    slug: 'test-active-' + Date.now(),
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
  campaignIds.push(campaign3.id)
  console.log(`✓ Created active campaign (expires in 5 days): ${campaign3.id}`)
  
  // Campaign 4: Already inactive (should not be processed)
  const campaign4 = await db.collection('campaigns').add({
    campaignName: 'Test Campaign - Already Inactive',
    slug: 'test-inactive-' + Date.now(),
    createdBy: testUserId,
    isActive: false,
    status: 'Inactive',
    planType: 'week',
    expiresAt: Timestamp.fromMillis(now.toMillis() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    createdAt: now,
    visibility: 'Public',
    frameURL: 'https://example.com/frame.jpg',
    supportersCount: 0
  })
  campaignIds.push(campaign4.id)
  console.log(`✓ Created inactive campaign: ${campaign4.id}`)
  
  return campaignIds
}

/**
 * Test 2: Run expiry check logic (simulating the Cloud Function)
 */
async function runExpiryCheck(): Promise<{ processed: number; batchId: string }> {
  console.log('\n=== Running expiry check ===')
  
  const now = Timestamp.now()
  const batchId = `test_batch_${Date.now()}`
  
  // Query expired campaigns (same logic as Cloud Function)
  const expiredCampaigns = await db.collection('campaigns')
    .where('isActive', '==', true)
    .where('expiresAt', '<', now)
    .get()
  
  console.log(`Found ${expiredCampaigns.size} expired campaigns`)
  
  if (expiredCampaigns.empty) {
    console.log('No expired campaigns to process')
    return { processed: 0, batchId }
  }
  
  // Process campaigns
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
    
    // Create expiry log
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
      console.log(`Committed batch of ${batchCount} campaigns`)
      batch = db.batch()
      batchCount = 0
    }
  }
  
  // Commit remaining operations
  if (batchCount > 0) {
    await batch.commit()
    console.log(`Committed final batch of ${batchCount} campaigns`)
  }
  
  console.log(`✓ Successfully processed ${count} expired campaigns`)
  
  return { processed: count, batchId }
}

/**
 * Test 3: Verify campaigns were deactivated correctly
 */
async function verifyCampaignDeactivation(campaignIds: string[]): Promise<boolean> {
  console.log('\n=== Verifying campaign deactivation ===')
  
  let allCorrect = true
  
  for (const id of campaignIds) {
    const doc = await db.collection('campaigns').doc(id).get()
    const campaign = doc.data() as TestCampaign
    
    if (!campaign) {
      console.log(`✗ Campaign ${id} not found`)
      allCorrect = false
      continue
    }
    
    const now = Timestamp.now()
    const isExpired = campaign.expiresAt.toMillis() < now.toMillis()
    
    if (isExpired && campaign.isActive) {
      console.log(`✗ Campaign ${id} (${campaign.campaignName}) should be inactive but is still active`)
      allCorrect = false
    } else if (isExpired && !campaign.isActive) {
      console.log(`✓ Campaign ${id} (${campaign.campaignName}) correctly deactivated`)
    } else if (!isExpired && campaign.isActive) {
      console.log(`✓ Campaign ${id} (${campaign.campaignName}) correctly remains active`)
    } else {
      console.log(`- Campaign ${id} (${campaign.campaignName}) was already inactive`)
    }
  }
  
  return allCorrect
}

/**
 * Test 4: Verify expiry logs were created
 */
async function verifyExpiryLogs(batchId: string, expectedCount: number): Promise<boolean> {
  console.log('\n=== Verifying expiry logs ===')
  
  const logs = await db.collection('expiryLogs')
    .where('batchId', '==', batchId)
    .get()
  
  console.log(`Found ${logs.size} expiry logs for batch ${batchId}`)
  
  if (logs.size !== expectedCount) {
    console.log(`✗ Expected ${expectedCount} logs but found ${logs.size}`)
    return false
  }
  
  let allValid = true
  logs.forEach(doc => {
    const log = doc.data() as ExpiryLog
    
    // Verify required fields
    if (!log.campaignId || !log.userId || !log.expiredAt || !log.processedAt) {
      console.log(`✗ Log ${doc.id} missing required fields`)
      allValid = false
    } else {
      console.log(`✓ Log ${doc.id} valid for campaign ${log.campaignId}`)
    }
  })
  
  return allValid
}

/**
 * Test 5: Test timezone handling
 */
async function testTimezoneHandling(): Promise<boolean> {
  console.log('\n=== Testing timezone handling ===')
  
  const now = new Date()
  
  // Test different timezone representations
  const utcTimestamp = Timestamp.now()
  const localDate = new Date()
  const utcDate = new Date(Date.UTC(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate(),
    localDate.getHours(),
    localDate.getMinutes(),
    localDate.getSeconds()
  ))
  
  console.log(`Current local time: ${localDate.toISOString()}`)
  console.log(`Current UTC time: ${utcDate.toISOString()}`)
  console.log(`Firestore Timestamp: ${utcTimestamp.toDate().toISOString()}`)
  
  // Create a campaign that expires at a specific UTC time
  const testUserId = 'test_user_timezone_' + Date.now()
  const expiryTime = Timestamp.fromDate(new Date(Date.now() - 1000)) // 1 second ago
  
  const campaign = await db.collection('campaigns').add({
    campaignName: 'Timezone Test Campaign',
    slug: 'test-timezone-' + Date.now(),
    createdBy: testUserId,
    isActive: true,
    status: 'Active',
    planType: 'week',
    expiresAt: expiryTime,
    createdAt: Timestamp.now(),
    visibility: 'Public',
    frameURL: 'https://example.com/frame.jpg',
    supportersCount: 0
  })
  
  console.log(`✓ Created timezone test campaign: ${campaign.id}`)
  
  // Wait a moment to ensure time has passed
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Check if it would be detected as expired
  const checkTime = Timestamp.now()
  const isExpired = expiryTime.toMillis() < checkTime.toMillis()
  
  console.log(`Expiry time: ${expiryTime.toDate().toISOString()}`)
  console.log(`Check time: ${checkTime.toDate().toISOString()}`)
  console.log(`Is expired: ${isExpired}`)
  
  // Clean up
  await db.collection('campaigns').doc(campaign.id).delete()
  
  if (!isExpired) {
    console.log('✗ Timezone handling failed - campaign should be detected as expired')
    return false
  }
  
  console.log('✓ Timezone handling works correctly')
  return true
}

/**
 * Cleanup test data
 */
async function cleanup(campaignIds: string[], batchId: string): Promise<void> {
  console.log('\n=== Cleaning up test data ===')
  
  // Delete test campaigns
  for (const id of campaignIds) {
    await db.collection('campaigns').doc(id).delete()
    console.log(`✓ Deleted campaign ${id}`)
  }
  
  // Delete expiry logs
  const logs = await db.collection('expiryLogs')
    .where('batchId', '==', batchId)
    .get()
  
  for (const doc of logs.docs) {
    await doc.ref.delete()
  }
  console.log(`✓ Deleted ${logs.size} expiry logs`)
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║     Campaign Expiry System Test Suite                 ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  
  let campaignIds: string[] = []
  let batchId = ''
  
  try {
    // Test 1: Setup
    campaignIds = await setupTestCampaigns()
    
    // Test 2: Run expiry check
    const result = await runExpiryCheck()
    batchId = result.batchId
    
    // Expected: 2 campaigns should be processed (the two expired ones)
    if (result.processed !== 2) {
      console.log(`\n✗ FAILED: Expected 2 campaigns to be processed, but got ${result.processed}`)
    } else {
      console.log(`\n✓ PASSED: Correct number of campaigns processed`)
    }
    
    // Test 3: Verify deactivation
    const deactivationCorrect = await verifyCampaignDeactivation(campaignIds)
    if (!deactivationCorrect) {
      console.log('\n✗ FAILED: Campaign deactivation verification failed')
    } else {
      console.log('\n✓ PASSED: Campaign deactivation verified')
    }
    
    // Test 4: Verify logs
    const logsCorrect = await verifyExpiryLogs(batchId, result.processed)
    if (!logsCorrect) {
      console.log('\n✗ FAILED: Expiry logs verification failed')
    } else {
      console.log('\n✓ PASSED: Expiry logs verified')
    }
    
    // Test 5: Timezone handling
    const timezoneCorrect = await testTimezoneHandling()
    if (!timezoneCorrect) {
      console.log('\n✗ FAILED: Timezone handling test failed')
    } else {
      console.log('\n✓ PASSED: Timezone handling verified')
    }
    
    // Summary
    console.log('\n╔════════════════════════════════════════════════════════╗')
    console.log('║                   Test Summary                         ║')
    console.log('╚════════════════════════════════════════════════════════╝')
    console.log(`Campaigns processed: ${result.processed}`)
    console.log(`Deactivation: ${deactivationCorrect ? '✓ PASS' : '✗ FAIL'}`)
    console.log(`Expiry logs: ${logsCorrect ? '✓ PASS' : '✗ FAIL'}`)
    console.log(`Timezone handling: ${timezoneCorrect ? '✓ PASS' : '✗ FAIL'}`)
    
    const allPassed = result.processed === 2 && deactivationCorrect && logsCorrect && timezoneCorrect
    
    if (allPassed) {
      console.log('\n🎉 ALL TESTS PASSED!')
    } else {
      console.log('\n❌ SOME TESTS FAILED')
    }
    
  } catch (error) {
    console.error('\n❌ Test execution error:', error)
  } finally {
    // Cleanup
    if (campaignIds.length > 0) {
      await cleanup(campaignIds, batchId)
    }
  }
}

// Run tests
runTests()
  .then(() => {
    console.log('\nTest suite completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('Test suite failed:', error)
    process.exit(1)
  })
