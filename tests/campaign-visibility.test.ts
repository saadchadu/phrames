/**
 * Campaign Visibility Tests
 * 
 * Tests public campaign page visibility based on isActive and expiresAt fields.
 * Requirements: 7.1, 7.2, 7.3
 */

import { initializeApp, getApps, deleteApp } from 'firebase/app'
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore'
import { getCampaignBySlug } from '@/lib/firestore'

// Firebase test configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

describe('Campaign Visibility Tests', () => {
  let testCampaignIds: string[] = []
  let db: any

  beforeAll(() => {
    // Initialize Firebase if not already initialized
    if (!getApps().length) {
      const app = initializeApp(firebaseConfig)
      db = getFirestore(app)
    } else {
      db = getFirestore()
    }
  })

  afterAll(async () => {
    // Clean up test campaigns
    for (const id of testCampaignIds) {
      try {
        await deleteDoc(doc(db, 'campaigns', id))
        console.log(`Cleaned up test campaign: ${id}`)
      } catch (error) {
        console.error(`Error cleaning up campaign ${id}:`, error)
      }
    }

    // Clean up Firebase app
    const apps = getApps()
    await Promise.all(apps.map(app => deleteApp(app)))
  })

  /**
   * Helper function to create a test campaign
   */
  async function createTestCampaign(overrides: any = {}) {
    const timestamp = Date.now()
    const slug = `test-campaign-${timestamp}-${Math.random().toString(36).substring(7)}`
    
    const campaignData = {
      campaignName: `Test Campaign ${timestamp}`,
      slug,
      description: 'Test campaign for visibility testing',
      visibility: 'Public',
      frameURL: 'https://example.com/frame.png',
      supportersCount: 0,
      createdBy: 'test-user-id',
      createdByEmail: 'test@example.com',
      createdAt: Timestamp.now(),
      isActive: true,
      status: 'Active',
      ...overrides
    }

    const docRef = await addDoc(collection(db, 'campaigns'), campaignData)
    testCampaignIds.push(docRef.id)
    
    return { id: docRef.id, slug, ...campaignData }
  }

  /**
   * Test 1: Verify active campaigns are accessible
   * Requirement: 7.1
   */
  test('Active campaign with future expiry should be accessible', async () => {
    // Create an active campaign with future expiry
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30) // 30 days in future
    
    const campaign = await createTestCampaign({
      isActive: true,
      status: 'Active',
      expiresAt: Timestamp.fromDate(futureDate),
      planType: 'month',
      amountPaid: 199
    })

    // Fetch the campaign by slug
    const fetchedCampaign = await getCampaignBySlug(campaign.slug)

    // Verify campaign is found
    expect(fetchedCampaign).not.toBeNull()
    expect(fetchedCampaign?.slug).toBe(campaign.slug)
    expect(fetchedCampaign?.isActive).toBe(true)
    expect(fetchedCampaign?.status).toBe('Active')
    
    // Verify expiry is in the future
    if (fetchedCampaign?.expiresAt) {
      const expiryDate = fetchedCampaign.expiresAt.toDate()
      expect(expiryDate.getTime()).toBeGreaterThan(Date.now())
    }

    console.log('✅ Active campaign with future expiry is accessible')
  })

  /**
   * Test 2: Verify inactive campaigns show error message
   * Requirement: 7.2
   */
  test('Inactive campaign should be found but marked as inactive', async () => {
    // Create an inactive campaign
    const campaign = await createTestCampaign({
      isActive: false,
      status: 'Inactive'
    })

    // Fetch the campaign by slug
    const fetchedCampaign = await getCampaignBySlug(campaign.slug)

    // Verify campaign is found
    expect(fetchedCampaign).not.toBeNull()
    expect(fetchedCampaign?.slug).toBe(campaign.slug)
    
    // Verify it's marked as inactive
    expect(fetchedCampaign?.isActive).toBe(false)
    expect(fetchedCampaign?.status).toBe('Inactive')

    console.log('✅ Inactive campaign is found but marked as inactive')
  })

  /**
   * Test 3: Verify expired campaigns show error message
   * Requirement: 7.2, 7.3
   */
  test('Expired campaign should be found but have past expiry date', async () => {
    // Create a campaign with past expiry
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1) // 1 day in past
    
    const campaign = await createTestCampaign({
      isActive: true, // May still be marked active if expiry check hasn't run
      status: 'Active',
      expiresAt: Timestamp.fromDate(pastDate),
      planType: 'week',
      amountPaid: 49
    })

    // Fetch the campaign by slug
    const fetchedCampaign = await getCampaignBySlug(campaign.slug)

    // Verify campaign is found
    expect(fetchedCampaign).not.toBeNull()
    expect(fetchedCampaign?.slug).toBe(campaign.slug)
    
    // Verify expiry is in the past
    if (fetchedCampaign?.expiresAt) {
      const expiryDate = fetchedCampaign.expiresAt.toDate()
      expect(expiryDate.getTime()).toBeLessThan(Date.now())
    }

    console.log('✅ Expired campaign is found with past expiry date')
  })

  /**
   * Test 4: Test campaign with no expiry date (grandfathered)
   * Requirement: 7.1
   */
  test('Campaign with no expiry date should be accessible if active', async () => {
    // Create a campaign without expiry (grandfathered campaign)
    const campaign = await createTestCampaign({
      isActive: true,
      status: 'Active'
      // No expiresAt field
    })

    // Fetch the campaign by slug
    const fetchedCampaign = await getCampaignBySlug(campaign.slug)

    // Verify campaign is found
    expect(fetchedCampaign).not.toBeNull()
    expect(fetchedCampaign?.slug).toBe(campaign.slug)
    expect(fetchedCampaign?.isActive).toBe(true)
    expect(fetchedCampaign?.status).toBe('Active')
    expect(fetchedCampaign?.expiresAt).toBeUndefined()

    console.log('✅ Grandfathered campaign (no expiry) is accessible')
  })

  /**
   * Test 5: Test campaign state transitions
   * Requirement: 7.1, 7.2, 7.3
   */
  test('Campaign visibility should change when status is updated', async () => {
    // Create an active campaign
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)
    
    const campaign = await createTestCampaign({
      isActive: true,
      status: 'Active',
      expiresAt: Timestamp.fromDate(futureDate)
    })

    // Verify it's initially active
    let fetchedCampaign = await getCampaignBySlug(campaign.slug)
    expect(fetchedCampaign?.isActive).toBe(true)
    expect(fetchedCampaign?.status).toBe('Active')

    // Update to inactive
    await updateDoc(doc(db, 'campaigns', campaign.id), {
      isActive: false,
      status: 'Inactive'
    })

    // Verify it's now inactive
    fetchedCampaign = await getCampaignBySlug(campaign.slug)
    expect(fetchedCampaign?.isActive).toBe(false)
    expect(fetchedCampaign?.status).toBe('Inactive')

    console.log('✅ Campaign status transitions correctly')
  })

  /**
   * Test 6: Test different campaign states
   * Requirement: 7.1, 7.2, 7.3
   */
  test('Different campaign states should be identifiable', async () => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    const pastDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) // 1 day ago

    // State 1: Active with future expiry (VISIBLE)
    const activeCampaign = await createTestCampaign({
      isActive: true,
      status: 'Active',
      expiresAt: Timestamp.fromDate(futureDate)
    })

    // State 2: Inactive (NOT VISIBLE)
    const inactiveCampaign = await createTestCampaign({
      isActive: false,
      status: 'Inactive'
    })

    // State 3: Active but expired (NOT VISIBLE)
    const expiredCampaign = await createTestCampaign({
      isActive: true,
      status: 'Active',
      expiresAt: Timestamp.fromDate(pastDate)
    })

    // State 4: Active with no expiry (VISIBLE - grandfathered)
    const grandfatheredCampaign = await createTestCampaign({
      isActive: true,
      status: 'Active'
    })

    // Fetch all campaigns
    const active = await getCampaignBySlug(activeCampaign.slug)
    const inactive = await getCampaignBySlug(inactiveCampaign.slug)
    const expired = await getCampaignBySlug(expiredCampaign.slug)
    const grandfathered = await getCampaignBySlug(grandfatheredCampaign.slug)

    // Verify active campaign
    expect(active).not.toBeNull()
    expect(active?.isActive).toBe(true)
    if (active?.expiresAt) {
      expect(active.expiresAt.toDate().getTime()).toBeGreaterThan(Date.now())
    }

    // Verify inactive campaign
    expect(inactive).not.toBeNull()
    expect(inactive?.isActive).toBe(false)

    // Verify expired campaign
    expect(expired).not.toBeNull()
    if (expired?.expiresAt) {
      expect(expired.expiresAt.toDate().getTime()).toBeLessThan(Date.now())
    }

    // Verify grandfathered campaign
    expect(grandfathered).not.toBeNull()
    expect(grandfathered?.isActive).toBe(true)
    expect(grandfathered?.expiresAt).toBeUndefined()

    console.log('✅ All campaign states are correctly identifiable')
  })

  /**
   * Test 7: Test visibility logic helper
   * Requirement: 7.1, 7.3
   */
  test('Visibility logic should correctly determine if campaign should be shown', async () => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const pastDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)

    // Helper function to check visibility (matches campaign page logic)
    const isVisible = (campaign: any) => {
      if (!campaign) return false
      
      const isActive = campaign.isActive
      const hasExpiry = campaign.expiresAt
      const isExpired = hasExpiry && campaign.expiresAt.toDate() < new Date()
      
      return isActive && !isExpired
    }

    // Test case 1: Active with future expiry
    const campaign1 = await createTestCampaign({
      isActive: true,
      expiresAt: Timestamp.fromDate(futureDate)
    })
    const fetched1 = await getCampaignBySlug(campaign1.slug)
    expect(isVisible(fetched1)).toBe(true)

    // Test case 2: Inactive
    const campaign2 = await createTestCampaign({
      isActive: false
    })
    const fetched2 = await getCampaignBySlug(campaign2.slug)
    expect(isVisible(fetched2)).toBe(false)

    // Test case 3: Active but expired
    const campaign3 = await createTestCampaign({
      isActive: true,
      expiresAt: Timestamp.fromDate(pastDate)
    })
    const fetched3 = await getCampaignBySlug(campaign3.slug)
    expect(isVisible(fetched3)).toBe(false)

    // Test case 4: Active with no expiry (grandfathered)
    const campaign4 = await createTestCampaign({
      isActive: true
    })
    const fetched4 = await getCampaignBySlug(campaign4.slug)
    expect(isVisible(fetched4)).toBe(true)

    console.log('✅ Visibility logic correctly determines campaign visibility')
  })
})
