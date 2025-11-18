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
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now()
    const batchId = `batch_${Date.now()}`
    
    try {
      console.log('Starting campaign expiry check...')
      
      // Query expired campaigns
      const expiredCampaigns = await db.collection('campaigns')
        .where('isActive', '==', true)
        .where('expiresAt', '<', now)
        .get()
      
      console.log(`Found ${expiredCampaigns.size} expired campaigns`)
      
      if (expiredCampaigns.empty) {
        console.log('No expired campaigns to process')
        return null
      }
      
      // Process in batches of 500 (Firestore limit)
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
        
        // Commit batch every 250 operations (500 / 2 since we do 2 operations per campaign)
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
      
      console.log(`Successfully processed ${count} expired campaigns`)
      
      // Log summary
      await db.collection('expiryLogs').doc(batchId).set({
        type: 'batch_summary',
        batchId,
        totalProcessed: count,
        processedAt: now,
        timestamp: now
      })
      
      return null
    } catch (error) {
      console.error('Error in expiry check:', error)
      
      // Log error
      await db.collection('expiryLogs').add({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        batchId,
        processedAt: now
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
  if (apiKey !== functions.config().expiry?.api_key) {
    res.status(401).send('Unauthorized')
    return
  }

  try {
    await scheduledCampaignExpiryCheck.run({} as any)
    res.status(200).send('Expiry check completed successfully')
  } catch (error) {
    console.error('Manual expiry check error:', error)
    res.status(500).send('Error running expiry check')
  }
})
