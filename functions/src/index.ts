/**
 * Firebase Cloud Functions for Campaign Expiry Management
 * 
 * SETUP INSTRUCTIONS:
 * 1. Initialize Firebase Functions in your project:
 *    firebase init functions
 * 
 * 2. Copy this file to functions/src/index.ts
 * 
 * 3. Install dependencies:
 *    cd functions
 *    npm install
 * 
 * 4. Deploy the function:
 *    firebase deploy --only functions:scheduledCampaignExpiryCheck
 * 
 * The function will run daily at midnight UTC to check for expired campaigns
 */

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// Initialize Firebase Admin
admin.initializeApp()

const db = admin.firestore()

/**
 * Scheduled function that runs daily to check for expired campaigns
 * and automatically deactivate them
 */
export const scheduledCampaignExpiryCheck = functions.pubsub
  .schedule('0 0 * * *') // Run daily at midnight UTC
  .timeZone('UTC')
  .onRun(async () => {
    const startTime = Date.now()
    const now = admin.firestore.Timestamp.now()
    const batchId = `batch_${Date.now()}`
    
    try {
      console.log('ℹ️  INFO [expiry_check_started] Starting campaign expiry check', { batchId })
      
      // Query expired campaigns
      const expiredCampaigns = await db.collection('campaigns')
        .where('isActive', '==', true)
        .where('expiresAt', '<', now)
        .get()
      
      console.log(`ℹ️  INFO [expiry_check_started] Found ${expiredCampaigns.size} expired campaigns`, {
        count: expiredCampaigns.size,
        batchId
      })
      
      if (expiredCampaigns.empty) {
        const duration = Date.now() - startTime
        console.log('ℹ️  INFO [expiry_check_completed] No expired campaigns to process', {
          duration,
          batchId
        })
        
        // Log summary even if no campaigns
        await db.collection('expiryLogs').doc(batchId).set({
          type: 'batch_summary',
          batchId,
          totalProcessed: 0,
          processedAt: now,
          timestamp: now,
          duration
        })
        
        return null
      }
      
      // Process in batches of 500 (Firestore limit)
      let batch = db.batch()
      let count = 0
      let batchCount = 0
      const campaignIds: string[] = []
      
      for (const doc of expiredCampaigns.docs) {
        const campaign = doc.data()
        campaignIds.push(doc.id)
        
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
        
        // Commit batch every 250 operations (500 / 2 since we do 2 operations per campaign)
        if (batchCount >= 250) {
          await batch.commit()
          console.log(`ℹ️  INFO [expiry_check_started] Committed batch of ${batchCount} campaigns`, {
            batchCount,
            totalSoFar: count,
            batchId
          })
          batch = db.batch()
          batchCount = 0
        }
      }
      
      // Commit remaining operations
      if (batchCount > 0) {
        await batch.commit()
        console.log(`ℹ️  INFO [expiry_check_started] Committed final batch of ${batchCount} campaigns`, {
          batchCount,
          batchId
        })
      }
      
      const duration = Date.now() - startTime
      console.log(`ℹ️  INFO [expiry_check_completed] Successfully processed ${count} expired campaigns`, {
        count,
        duration,
        batchId
      })
      
      // Log summary
      await db.collection('expiryLogs').doc(batchId).set({
        type: 'batch_summary',
        batchId,
        totalProcessed: count,
        processedAt: now,
        timestamp: now,
        duration,
        campaignIds: campaignIds.slice(0, 100) // Store first 100 IDs
      })
      
      return null
    } catch (error) {
      const duration = Date.now() - startTime
      console.error('❌ ERROR [expiry_check_failed] Error in expiry check', {
        error: error instanceof Error ? error.message : 'Unknown error',
        batchId,
        duration
      })
      
      // Log error
      await db.collection('expiryLogs').add({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        batchId,
        processedAt: now,
        duration
      })
      
      throw error
    }
  })

/**
 * Optional: Manual trigger function for testing
 * Can be called via Firebase Console or HTTP request
 */
export const manualCampaignExpiryCheck = functions.https.onRequest(async (req, res) => {
  // Add authentication check here if needed
  const apiKey = req.headers['x-api-key']
  const expectedKey = functions.config().expiry?.api_key
  
  if (expectedKey && apiKey !== expectedKey) {
    res.status(401).send('Unauthorized')
    return
  }

  const now = admin.firestore.Timestamp.now()
  const batchId = `batch_${Date.now()}_manual`
  
  try {
    console.log('Starting manual campaign expiry check...')
    
    // Query expired campaigns
    const expiredCampaigns = await db.collection('campaigns')
      .where('isActive', '==', true)
      .where('expiresAt', '<', now)
      .get()
    
    console.log(`Found ${expiredCampaigns.size} expired campaigns`)
    
    if (expiredCampaigns.empty) {
      res.status(200).json({ 
        success: true, 
        message: 'No expired campaigns to process',
        count: 0
      })
      return
    }
    
    // Process in batches
    let batch = db.batch()
    let count = 0
    let batchCount = 0
    
    for (const doc of expiredCampaigns.docs) {
      const campaign = doc.data()
      
      batch.update(doc.ref, {
        isActive: false,
        status: 'Inactive'
      })
      
      const logRef = db.collection('expiryLogs').doc()
      batch.set(logRef, {
        campaignId: doc.id,
        campaignName: campaign.campaignName || 'Unknown',
        userId: campaign.createdBy,
        expiredAt: campaign.expiresAt,
        planType: campaign.planType || 'unknown',
        processedAt: now,
        batchId,
        manual: true
      })
      
      count++
      batchCount++
      
      if (batchCount >= 250) {
        await batch.commit()
        batch = db.batch()
        batchCount = 0
      }
    }
    
    if (batchCount > 0) {
      await batch.commit()
    }
    
    console.log(`Successfully processed ${count} expired campaigns`)
    
    res.status(200).json({ 
      success: true, 
      message: 'Expiry check completed successfully',
      count
    })
  } catch (error) {
    console.error('Manual expiry check error:', error)
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
