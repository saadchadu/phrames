/**
 * Firebase Cloud Functions for Campaign Management
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
 * 4. Deploy the functions:
 *    firebase deploy --only functions
 * 
 * Functions included:
 * - scheduledCampaignExpiryCheck: Daily expiry check for paid campaigns
 * - scheduledInactiveCampaignCleanup: Daily cleanup for inactive campaigns (30+ days)
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
      
      // Create admin log for cron execution start
      await db.collection('logs').add({
        eventType: 'cron_execution',
        actorId: 'system',
        description: 'Campaign expiry check cron job started',
        metadata: {
          cronType: 'campaign_expiry_check',
          batchId,
          startTime: new Date(startTime).toISOString()
        },
        createdAt: now
      })
      
      // Get campaigns that have expired
      const expiredCampaigns = await db.collection('campaigns')
        .where('isActive', '==', true)
        .where('expiresAt', '<=', now)
        .get()
      
      console.log(`ℹ️  INFO [expiry_check] Found ${expiredCampaigns.size} expired campaigns`)
      
      if (expiredCampaigns.empty) {
        const duration = Date.now() - startTime
        console.log('ℹ️  INFO [expiry_check_completed] No expired campaigns found', { duration, batchId })
        
        await db.collection('logs').add({
          eventType: 'cron_execution',
          actorId: 'system',
          description: 'Campaign expiry check completed - no expired campaigns',
          metadata: {
            cronType: 'campaign_expiry_check',
            result: 'success',
            batchId,
            campaignsProcessed: 0,
            duration
          },
          createdAt: now
        })
        
        return null
      }
      
      // Process in batches of 500 (Firestore limit)
      let batch = db.batch()
      let count = 0
      let batchCount = 0
      const campaignIds: string[] = []
      const expiredCampaignDetails: any[] = []
      
      for (const doc of expiredCampaigns.docs) {
        const campaign = doc.data()
        campaignIds.push(doc.id)
        expiredCampaignDetails.push({
          id: doc.id,
          name: campaign.campaignName,
          userId: campaign.createdBy
        })
        
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
        
        // Create admin log for each campaign expiry
        const adminLogRef = db.collection('logs').doc()
        batch.set(adminLogRef, {
          eventType: 'campaign_expiry',
          actorId: 'system',
          description: `Campaign "${campaign.campaignName || 'Unknown'}" expired`,
          metadata: {
            campaignId: doc.id,
            campaignName: campaign.campaignName || 'Unknown',
            userId: campaign.createdBy,
            planType: campaign.planType || 'unknown',
            expiredAt: campaign.expiresAt?.toDate()?.toISOString()
          },
          createdAt: now
        })
        
        count++
        batchCount++
        
        // Commit batch every 166 operations (500 / 3 since we do 3 operations per campaign)
        if (batchCount >= 166) {
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
      await db.collection('logs').add({
        eventType: 'cron_execution',
        actorId: 'system',
        description: `Campaign expiry check completed - processed ${count} campaigns`,
        metadata: {
          cronType: 'campaign_expiry_check',
          result: 'success',
          batchId,
          campaignsProcessed: count,
          expiredCampaignDetails,
          duration
        },
        createdAt: now
      })
      
      console.log(`Successfully processed ${count} expired campaigns`)
      
      return null
    } catch (error) {
      console.error('Campaign expiry check error:', error)
      
      // Log error
      await db.collection('logs').add({
        eventType: 'cron_execution',
        actorId: 'system',
        description: 'Campaign expiry check failed',
        metadata: {
          cronType: 'campaign_expiry_check',
          result: 'error',
          batchId,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        createdAt: admin.firestore.Timestamp.now()
      })
      
      throw error
    }
  })

/**
 * Manual trigger for campaign expiry check (for testing/admin use)
 */
export const manualCampaignExpiryCheck = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  
  try {
    // Get campaigns that have expired
    const now = admin.firestore.Timestamp.now()
    const expiredCampaigns = await db.collection('campaigns')
      .where('isActive', '==', true)
      .where('expiresAt', '<=', now)
      .get()
    
    if (expiredCampaigns.empty) {
      res.status(200).json({ 
        success: true, 
        message: 'No expired campaigns found',
        count: 0
      })
      return
    }
    
    // Process expired campaigns
    let count = 0
    const batch = db.batch()
    
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
        batchId: `manual_${Date.now()}`
      })
      
      count++
    }
    
    await batch.commit()
    
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

/**
 * Scheduled function that runs daily to cleanup inactive campaigns
 * Deletes campaigns that have been inactive for 30+ days
 */
export const scheduledInactiveCampaignCleanup = functions.pubsub
  .schedule('0 1 * * *') // Run daily at 1 AM UTC (after expiry check)
  .timeZone('UTC')
  .onRun(async () => {
    const startTime = Date.now()
    const now = admin.firestore.Timestamp.now()
    const batchId = `inactive_cleanup_${Date.now()}`
    
    try {
      console.log('🧹 INFO [inactive_cleanup_started] Starting inactive campaign cleanup', { batchId })
      
      // Create admin log for cleanup start
      await db.collection('logs').add({
        eventType: 'cron_execution',
        actorId: 'system',
        description: 'Inactive campaign cleanup cron job started',
        metadata: {
          cronType: 'inactive_campaign_cleanup',
          batchId,
          startTime: new Date(startTime).toISOString()
        },
        createdAt: now
      })
      
      // Get campaigns that have been inactive for 30+ days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const inactiveCampaigns = await db.collection('campaigns')
        .where('isActive', '==', false)
        .where('status', '==', 'Inactive')
        .get()
      
      console.log(`🧹 INFO [inactive_cleanup] Found ${inactiveCampaigns.size} inactive campaigns to analyze`)
      
      let deletedCount = 0
      const batch = db.batch()
      
      for (const doc of inactiveCampaigns.docs) {
        const campaign = doc.data()
        const createdAt = campaign.createdAt?.toDate() || new Date()
        
        // Check if campaign has been inactive for 30+ days
        if (createdAt < thirtyDaysAgo) {
          // Delete the campaign
          batch.delete(doc.ref)
          deletedCount++
          
          // Log the deletion
          const logRef = db.collection('logs').doc()
          batch.set(logRef, {
            eventType: 'campaign_deletion',
            actorId: 'system',
            description: `Deleted inactive campaign: ${campaign.campaignName}`,
            metadata: {
              campaignId: doc.id,
              campaignName: campaign.campaignName,
              userId: campaign.createdBy,
              reason: 'inactive_cleanup',
              daysInactive: Math.floor((Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000)),
              batchId
            },
            createdAt: now
          })
        }
      }
      
      // Commit all deletions
      if (deletedCount > 0) {
        await batch.commit()
        console.log(`🧹 INFO [inactive_cleanup] Deleted ${deletedCount} inactive campaigns`)
      }
      
      const duration = Date.now() - startTime
      console.log(`🧹 INFO [inactive_cleanup_completed] Cleanup completed`, {
        analyzed: inactiveCampaigns.size,
        deleted: deletedCount,
        duration,
        batchId
      })
      
      // Log summary
      await db.collection('logs').add({
        eventType: 'cron_execution',
        actorId: 'system',
        description: `Inactive campaign cleanup completed - deleted ${deletedCount} campaigns`,
        metadata: {
          cronType: 'inactive_campaign_cleanup',
          result: 'success',
          batchId,
          campaignsAnalyzed: inactiveCampaigns.size,
          campaignsDeleted: deletedCount,
          duration
        },
        createdAt: now
      })
      
      return null
    } catch (error) {
      console.error('Inactive campaign cleanup error:', error)
      
      // Log error
      await db.collection('logs').add({
        eventType: 'cron_execution',
        actorId: 'system',
        description: 'Inactive campaign cleanup failed',
        metadata: {
          cronType: 'inactive_campaign_cleanup',
          result: 'error',
          batchId,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        createdAt: admin.firestore.Timestamp.now()
      })
      
      throw error
    }
  })