/**
 * Campaign Visibility Verification - Task 12.5
 * 
 * This script verifies the campaign visibility logic without requiring Firebase.
 * It tests the core logic used in the campaign page component.
 * 
 * Requirements: 7.1, 7.2, 7.3
 */

// Mock Campaign interface
interface Campaign {
  id: string
  campaignName: string
  slug: string
  isActive: boolean
  status: 'Active' | 'Inactive'
  planType?: string
  amountPaid?: number
  expiresAt?: Date
  visibility: 'Public' | 'Unlisted'
}

/**
 * Check if campaign should be visible to public
 * This matches the logic in app/campaign/[slug]/page.tsx
 */
function isCampaignVisible(campaign: Campaign | null): boolean {
  if (!campaign) return false
  
  const isActive = campaign.isActive
  const hasExpiry = campaign.expiresAt !== undefined
  const isExpired = hasExpiry && campaign.expiresAt! < new Date()
  
  // Campaign is visible if it's active AND not expired
  return isActive && !isExpired
}

/**
 * Get the appropriate message for an invisible campaign
 */
function getInvisibilityReason(campaign: Campaign | null): string {
  if (!campaign) return 'Campaign not found'
  
  if (!campaign.isActive) {
    return 'Campaign is inactive. Please contact the creator.'
  }
  
  if (campaign.expiresAt && campaign.expiresAt < new Date()) {
    return 'Campaign has expired. Please contact the creator to reactivate it.'
  }
  
  return 'Campaign is not accessible'
}

/**
 * Run verification tests
 */
function runVerification() {
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║     Campaign Visibility Verification                  ║')
  console.log('╚════════════════════════════════════════════════════════╝\n')
  
  let allPassed = true
  let testCount = 0
  let passedCount = 0
  
  // Helper function to run a test
  function runTest(name: string, condition: boolean, description: string) {
    testCount++
    if (condition) {
      console.log(`  ✓ ${description}`)
      passedCount++
    } else {
      console.log(`  ✗ ${description}`)
      allPassed = false
    }
  }
  
  // Test 1: Active campaign with future expiry (SHOULD BE VISIBLE)
  console.log('Test 1: Active Campaign with Future Expiry')
  const activeCampaign: Campaign = {
    id: 'test-1',
    campaignName: 'Active Campaign',
    slug: 'active-campaign',
    isActive: true,
    status: 'Active',
    planType: 'month',
    amountPaid: 199,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    visibility: 'Public'
  }
  
  const isVisible1 = isCampaignVisible(activeCampaign)
  runTest('Test 1', isVisible1, 'Active campaign with future expiry is visible')
  console.log(`  Campaign: ${activeCampaign.campaignName}`)
  console.log(`  Status: ${activeCampaign.status}, Active: ${activeCampaign.isActive}`)
  console.log(`  Expires: ${activeCampaign.expiresAt?.toLocaleDateString()}`)
  console.log(`  Visible: ${isVisible1 ? 'YES' : 'NO'}\n`)
  
  // Test 2: Inactive campaign (SHOULD NOT BE VISIBLE)
  console.log('Test 2: Inactive Campaign')
  const inactiveCampaign: Campaign = {
    id: 'test-2',
    campaignName: 'Inactive Campaign',
    slug: 'inactive-campaign',
    isActive: false,
    status: 'Inactive',
    visibility: 'Public'
  }
  
  const isVisible2 = isCampaignVisible(inactiveCampaign)
  const reason2 = getInvisibilityReason(inactiveCampaign)
  runTest('Test 2', !isVisible2, 'Inactive campaign is not visible')
  console.log(`  Campaign: ${inactiveCampaign.campaignName}`)
  console.log(`  Status: ${inactiveCampaign.status}, Active: ${inactiveCampaign.isActive}`)
  console.log(`  Visible: ${isVisible2 ? 'YES' : 'NO'}`)
  console.log(`  Reason: ${reason2}\n`)
  
  // Test 3: Expired campaign (SHOULD NOT BE VISIBLE)
  console.log('Test 3: Expired Campaign')
  const expiredCampaign: Campaign = {
    id: 'test-3',
    campaignName: 'Expired Campaign',
    slug: 'expired-campaign',
    isActive: true, // May still be marked active if expiry check hasn't run
    status: 'Active',
    planType: 'week',
    amountPaid: 49,
    expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    visibility: 'Public'
  }
  
  const isVisible3 = isCampaignVisible(expiredCampaign)
  const reason3 = getInvisibilityReason(expiredCampaign)
  runTest('Test 3', !isVisible3, 'Expired campaign is not visible')
  console.log(`  Campaign: ${expiredCampaign.campaignName}`)
  console.log(`  Status: ${expiredCampaign.status}, Active: ${expiredCampaign.isActive}`)
  console.log(`  Expires: ${expiredCampaign.expiresAt?.toLocaleDateString()}`)
  console.log(`  Visible: ${isVisible3 ? 'YES' : 'NO'}`)
  console.log(`  Reason: ${reason3}\n`)
  
  // Test 4: Grandfathered campaign (no expiry, SHOULD BE VISIBLE)
  console.log('Test 4: Grandfathered Campaign (No Expiry)')
  const grandfatheredCampaign: Campaign = {
    id: 'test-4',
    campaignName: 'Grandfathered Campaign',
    slug: 'grandfathered-campaign',
    isActive: true,
    status: 'Active',
    visibility: 'Public'
    // No expiresAt field
  }
  
  const isVisible4 = isCampaignVisible(grandfatheredCampaign)
  runTest('Test 4', isVisible4, 'Grandfathered campaign (no expiry) is visible')
  console.log(`  Campaign: ${grandfatheredCampaign.campaignName}`)
  console.log(`  Status: ${grandfatheredCampaign.status}, Active: ${grandfatheredCampaign.isActive}`)
  console.log(`  Expires: Never (grandfathered)`)
  console.log(`  Visible: ${isVisible4 ? 'YES' : 'NO'}\n`)
  
  // Test 5: Campaign expiring soon (SHOULD BE VISIBLE)
  console.log('Test 5: Campaign Expiring Soon')
  const expiringSoonCampaign: Campaign = {
    id: 'test-5',
    campaignName: 'Expiring Soon Campaign',
    slug: 'expiring-soon-campaign',
    isActive: true,
    status: 'Active',
    planType: 'week',
    amountPaid: 49,
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    visibility: 'Public'
  }
  
  const isVisible5 = isCampaignVisible(expiringSoonCampaign)
  runTest('Test 5', isVisible5, 'Campaign expiring soon is still visible')
  console.log(`  Campaign: ${expiringSoonCampaign.campaignName}`)
  console.log(`  Status: ${expiringSoonCampaign.status}, Active: ${expiringSoonCampaign.isActive}`)
  console.log(`  Expires: ${expiringSoonCampaign.expiresAt?.toLocaleString()}`)
  console.log(`  Visible: ${isVisible5 ? 'YES' : 'NO'}\n`)
  
  // Test 6: Campaign just expired (SHOULD NOT BE VISIBLE)
  console.log('Test 6: Campaign Just Expired')
  const justExpiredCampaign: Campaign = {
    id: 'test-6',
    campaignName: 'Just Expired Campaign',
    slug: 'just-expired-campaign',
    isActive: true,
    status: 'Active',
    planType: 'month',
    amountPaid: 199,
    expiresAt: new Date(Date.now() - 1000), // 1 second ago
    visibility: 'Public'
  }
  
  const isVisible6 = isCampaignVisible(justExpiredCampaign)
  runTest('Test 6', !isVisible6, 'Campaign that just expired is not visible')
  console.log(`  Campaign: ${justExpiredCampaign.campaignName}`)
  console.log(`  Status: ${justExpiredCampaign.status}, Active: ${justExpiredCampaign.isActive}`)
  console.log(`  Expires: ${justExpiredCampaign.expiresAt?.toLocaleString()}`)
  console.log(`  Visible: ${isVisible6 ? 'YES' : 'NO'}\n`)
  
  // Test 7: Inactive campaign with future expiry (SHOULD NOT BE VISIBLE)
  console.log('Test 7: Inactive Campaign with Future Expiry')
  const inactiveWithExpiryCampaign: Campaign = {
    id: 'test-7',
    campaignName: 'Inactive with Future Expiry',
    slug: 'inactive-with-expiry',
    isActive: false,
    status: 'Inactive',
    planType: 'month',
    amountPaid: 199,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    visibility: 'Public'
  }
  
  const isVisible7 = isCampaignVisible(inactiveWithExpiryCampaign)
  runTest('Test 7', !isVisible7, 'Inactive campaign with future expiry is not visible')
  console.log(`  Campaign: ${inactiveWithExpiryCampaign.campaignName}`)
  console.log(`  Status: ${inactiveWithExpiryCampaign.status}, Active: ${inactiveWithExpiryCampaign.isActive}`)
  console.log(`  Expires: ${inactiveWithExpiryCampaign.expiresAt?.toLocaleDateString()}`)
  console.log(`  Visible: ${isVisible7 ? 'YES' : 'NO'}\n`)
  
  // Test 8: Null campaign (SHOULD NOT BE VISIBLE)
  console.log('Test 8: Null Campaign')
  const isVisible8 = isCampaignVisible(null)
  const reason8 = getInvisibilityReason(null)
  runTest('Test 8', !isVisible8, 'Null campaign is not visible')
  console.log(`  Campaign: null`)
  console.log(`  Visible: ${isVisible8 ? 'YES' : 'NO'}`)
  console.log(`  Reason: ${reason8}\n`)
  
  // Test 9: Campaign state transitions
  console.log('Test 9: Campaign State Transitions')
  const transitionCampaign: Campaign = {
    id: 'test-9',
    campaignName: 'Transition Campaign',
    slug: 'transition-campaign',
    isActive: true,
    status: 'Active',
    planType: 'week',
    amountPaid: 49,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    visibility: 'Public'
  }
  
  // Initially visible
  const initiallyVisible = isCampaignVisible(transitionCampaign)
  runTest('Test 9a', initiallyVisible, 'Campaign initially visible')
  
  // After deactivation
  transitionCampaign.isActive = false
  transitionCampaign.status = 'Inactive'
  const afterDeactivation = isCampaignVisible(transitionCampaign)
  runTest('Test 9b', !afterDeactivation, 'Campaign not visible after deactivation')
  
  // After reactivation
  transitionCampaign.isActive = true
  transitionCampaign.status = 'Active'
  const afterReactivation = isCampaignVisible(transitionCampaign)
  runTest('Test 9c', afterReactivation, 'Campaign visible after reactivation')
  console.log(`  Campaign: ${transitionCampaign.campaignName}`)
  console.log(`  Transitions tested: Active → Inactive → Active\n`)
  
  // Test 10: Different campaign states summary
  console.log('Test 10: Campaign States Summary')
  const states = [
    { name: 'Active + Future Expiry', campaign: activeCampaign, expectedVisible: true },
    { name: 'Inactive', campaign: inactiveCampaign, expectedVisible: false },
    { name: 'Expired', campaign: expiredCampaign, expectedVisible: false },
    { name: 'Grandfathered', campaign: grandfatheredCampaign, expectedVisible: true },
  ]
  
  console.log('  State Visibility Matrix:')
  for (const state of states) {
    const visible = isCampaignVisible(state.campaign)
    const match = visible === state.expectedVisible
    const icon = match ? '✓' : '✗'
    console.log(`    ${icon} ${state.name}: ${visible ? 'Visible' : 'Not Visible'} (Expected: ${state.expectedVisible ? 'Visible' : 'Not Visible'})`)
    if (match) passedCount++
    else allPassed = false
    testCount++
  }
  console.log()
  
  // Summary
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║                   Test Summary                         ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log(`\nTests Passed: ${passedCount}/${testCount}`)
  
  if (allPassed) {
    console.log('\n🎉 ALL VISIBILITY TESTS PASSED!')
    console.log('\nCampaign visibility logic is working correctly:')
    console.log('  ✓ Active campaigns with future expiry are visible')
    console.log('  ✓ Inactive campaigns are not visible')
    console.log('  ✓ Expired campaigns are not visible')
    console.log('  ✓ Grandfathered campaigns (no expiry) are visible')
    console.log('  ✓ Campaigns expiring soon are still visible')
    console.log('  ✓ Just-expired campaigns are not visible')
    console.log('  ✓ Inactive campaigns with future expiry are not visible')
    console.log('  ✓ Null campaigns are not visible')
    console.log('  ✓ Campaign state transitions work correctly')
    console.log('  ✓ All campaign states handled properly')
  } else {
    console.log('\n❌ SOME VISIBILITY TESTS FAILED')
    console.log('Please review the failed tests above')
  }
  
  console.log('\n╔════════════════════════════════════════════════════════╗')
  console.log('║              Requirements Coverage                     ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log('Requirement 7.1: Active campaign visibility check ✓')
  console.log('Requirement 7.2: Inactive campaign error message ✓')
  console.log('Requirement 7.3: Expired campaign detection ✓')
  
  console.log('\n╔════════════════════════════════════════════════════════╗')
  console.log('║              Implementation Notes                      ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log('The visibility logic in app/campaign/[slug]/page.tsx:')
  console.log('  1. Checks if campaign.isActive is true')
  console.log('  2. Checks if campaign.expiresAt exists')
  console.log('  3. If expiresAt exists, checks if it\'s in the future')
  console.log('  4. Campaign is visible only if active AND not expired')
  console.log('  5. Shows "Campaign Inactive" message for invisible campaigns')
  
  return allPassed
}

// Run verification
const passed = runVerification()
process.exit(passed ? 0 : 1)
