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

/**
 * Scheduled function that runs every 6 hours to fix stuck campaigns and supporters counts
 * This ensures campaigns are properly activated and supporters counts are accurate
 */
export const scheduledCampaignFix = functions.pubsub
  .schedule('0 */6 * * *') // Run every 6 hours
  .timeZone('UTC')
  .onRun(async () => {
    const startTime = Date.now()
    const now = admin.firestore.Timestamp.now()
    const batchId = `campaign_fix_${Date.now()}`
    
    try {
      console.log('🔧 INFO [campaign_fix_started] Starting campaign fix job', { batchId })
      
      // Create admin log for fix start
      await db.collection('logs').add({
        eventType: 'cron_execution',
        actorId: 'system',
        description: 'Campaign fix cron job started',
        metadata: {
          cronType: 'campaign_fix',
          batchId,
          startTime: new Date(startTime).toISOString()
        },
        createdAt: now
      })
      
      // Find campaigns that should be active but aren't
      const inactiveCampaigns = await db.collection('campaigns')
        .where('isActive', '==', false)
        .get()
      
      console.log(`🔧 INFO [campaign_fix] Found ${inactiveCampaigns.size} inactive campaigns to analyze`)
      
      let fixedCount = 0
      const batch = db.batch()
      
      for (const campaignDoc of inactiveCampaigns.docs) {
        const campaignId = campaignDoc.id
        const campaignData = campaignDoc.data()
        let shouldActivate = false
        let updateData: any = {
          isActive: true,
          status: 'Active',
          lastPaymentAt: now
        }
        
        // Check if there are successful payments for this campaign (paid campaigns)
        const successfulPayments = await db.collection('payments')
          .where('campaignId', '==', campaignId)
          .where('status', '==', 'success')
          .limit(1)
          .get()
        
        if (!successfulPayments.empty) {
          // This is a paid campaign with successful payment
          const payment = successfulPayments.docs[0].data()
          shouldActivate = true
          
          // Calculate expiry date
          const planDurations: { [key: string]: number } = {
            'week': 7,
            'month': 30,
            '3month': 90,
            '6month': 180,
            'year': 365
          }
          
          const days = planDurations[payment.planType]
          let expiryDate = null
          if (days) {
            expiryDate = new Date()
            expiryDate.setDate(expiryDate.getDate() + days)
          }
          
          updateData = {
            ...updateData,
            isFreeCampaign: false,
            planType: payment.planType,
            amountPaid: payment.amount,
            paymentId: payment.orderId,
            expiresAt: expiryDate ? admin.firestore.Timestamp.fromDate(expiryDate) : null,
          }
        } else {
          // Check if this should be a free campaign
          const userId = campaignData.createdBy
          if (userId) {
            const userDoc = await db.collection('users').doc(userId).get()
            const userData = userDoc.exists ? userDoc.data() : null
            
            // If user hasn't used free campaign or if campaign was created as free
            if (!userData?.freeCampaignUsed || campaignData.isFreeCampaign === true) {
              shouldActivate = true
              
              // Set as free campaign with 30-day expiry
              const expiryDate = new Date()
              expiryDate.setDate(expiryDate.getDate() + 30)
              
              updateData = {
                ...updateData,
                isFreeCampaign: true,
                planType: 'free',
                amountPaid: 0,
                paymentId: null,
                expiresAt: admin.firestore.Timestamp.fromDate(expiryDate),
              }
              
              // Mark user's free campaign as used if not already
              if (!userData?.freeCampaignUsed) {
                if (userDoc.exists) {
                  batch.update(userDoc.ref, { freeCampaignUsed: true })
                } else {
                  batch.set(userDoc.ref, {
                    uid: userId,
                    freeCampaignUsed: true,
                    createdAt: now
                  })
                }
              }
            }
          }
        }
        
        if (shouldActivate) {
          batch.update(campaignDoc.ref, updateData)
          fixedCount++
          
          // Log the fix
          const logRef = db.collection('logs').doc()
          batch.set(logRef, {
            eventType: 'campaign_auto_fix',
            actorId: 'system',
            description: `Auto-fixed stuck campaign: ${campaignData.campaignName}`,
            metadata: {
              campaignId,
              campaignName: campaignData.campaignName,
              userId: campaignData.createdBy,
              fixType: updateData.isFreeCampaign ? 'free' : 'paid',
              planType: updateData.planType,
              batchId
            },
            createdAt: now
          })
        }
      }
      
      // Now fix supporters counts for all active campaigns
      const activeCampaigns = await db.collection('campaigns')
        .where('isActive', '==', true)
        .get()
      
      let supportersFixed = 0
      
      for (const campaignDoc of activeCampaigns.docs) {
        const campaignId = campaignDoc.id
        const campaignData = campaignDoc.data()
        
        // Count actual supporters
        const supporters = await db.collection('supporters')
          .where('campaignId', '==', campaignId)
          .get()
        
        const actualCount = supporters.size
        const currentCount = campaignData.supportersCount || 0
        
        // Update if counts don't match
        if (actualCount !== currentCount) {
          batch.update(campaignDoc.ref, {
            supportersCount: actualCount
          })
          supportersFixed++
        }
      }
      
      // Commit all fixes
      if (fixedCount > 0 || supportersFixed > 0) {
        await batch.commit()
        console.log(`🔧 INFO [campaign_fix] Fixed ${fixedCount} campaigns and ${supportersFixed} supporter counts`)
      }
      
      const duration = Date.now() - startTime
      console.log(`🔧 INFO [campaign_fix_completed] Fix job completed`, {
        campaignsFixed: fixedCount,
        supportersFixed,
        duration,
        batchId
      })
      
      // Log summary
      await db.collection('logs').add({
        eventType: 'cron_execution',
        actorId: 'system',
        description: `Campaign fix completed - fixed ${fixedCount} campaigns and ${supportersFixed} supporter counts`,
        metadata: {
          cronType: 'campaign_fix',
          result: 'success',
          batchId,
          campaignsFixed: fixedCount,
          supportersFixed,
          duration
        },
        createdAt: now
      })
      
      return null
    } catch (error) {
      console.error('Campaign fix error:', error)
      
      // Log error
      await db.collection('logs').add({
        eventType: 'cron_execution',
        actorId: 'system',
        description: 'Campaign fix failed',
        metadata: {
          cronType: 'campaign_fix',
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
 * Scheduled function that runs every hour to update trending scores
 * This pre-calculates trending data for better homepage performance
 */
export const scheduledTrendingUpdate = functions.pubsub
  .schedule('0 * * * *') // Run every hour
  .timeZone('UTC')
  .onRun(async () => {
    const startTime = Date.now()
    const now = admin.firestore.Timestamp.now()
    const batchId = `trending_update_${Date.now()}`
    
    try {
      console.log('📈 INFO [trending_update_started] Starting trending scores update', { batchId })
      
      // Create admin log for trending update start
      await db.collection('logs').add({
        eventType: 'cron_execution',
        actorId: 'system',
        description: 'Trending scores update cron job started',
        metadata: {
          cronType: 'trending_update',
          batchId,
          startTime: new Date(startTime).toISOString()
        },
        createdAt: now
      })
      
      // Get all active public campaigns
      const activeCampaigns = await db.collection('campaigns')
        .where('isActive', '==', true)
        .where('visibility', '==', 'Public')
        .where('status', '==', 'Active')
        .get()
      
      console.log(`📈 INFO [trending_update] Found ${activeCampaigns.size} active campaigns to update`)
      
      let updatedCount = 0
      const batch = db.batch()
      
      // Get date range for weekly downloads (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const cutoffDateStr = sevenDaysAgo.toISOString().split('T')[0]
      
      for (const campaignDoc of activeCampaigns.docs) {
        const campaignId = campaignDoc.id
        const campaignData = campaignDoc.data()
        
        // Get weekly downloads for this campaign
        const weeklyStatsQuery = await db.collection('CampaignStatsDaily')
          .where('campaignId', '==', campaignId)
          .where('date', '>=', cutoffDateStr)
          .get()
        
        let weeklyDownloads = 0
        weeklyStatsQuery.forEach((doc) => {
          const data = doc.data()
          weeklyDownloads += data.downloads || 0
        })
        
        // Calculate trending score
        const supportersCount = campaignData.supportersCount || 0
        const supportersWeight = 0.7
        const downloadsWeight = 0.3
        
        const normalizedSupporters = Math.log(supportersCount + 1) * 10
        const normalizedDownloads = Math.log(weeklyDownloads + 1) * 10
        
        const trendingScore = (normalizedSupporters * supportersWeight) + (normalizedDownloads * downloadsWeight)
        
        // Update campaign with trending data
        batch.update(campaignDoc.ref, {
          weeklyDownloads,
          trendingScore,
          trendingUpdatedAt: now
        })
        
        updatedCount++
      }
      
      // Commit all updates
      if (updatedCount > 0) {
        await batch.commit()
        console.log(`📈 INFO [trending_update] Updated ${updatedCount} campaigns with trending scores`)
      }
      
      const duration = Date.now() - startTime
      console.log(`📈 INFO [trending_update_completed] Trending update completed`, {
        campaignsUpdated: updatedCount,
        duration,
        batchId
      })
      
      // Log summary
      await db.collection('logs').add({
        eventType: 'cron_execution',
        actorId: 'system',
        description: `Trending scores update completed - updated ${updatedCount} campaigns`,
        metadata: {
          cronType: 'trending_update',
          result: 'success',
          batchId,
          campaignsUpdated: updatedCount,
          duration
        },
        createdAt: now
      })
      
      return null
    } catch (error) {
      console.error('Trending update error:', error)
      
      // Log error
      await db.collection('logs').add({
        eventType: 'cron_execution',
        actorId: 'system',
        description: 'Trending scores update failed',
        metadata: {
          cronType: 'trending_update',
          result: 'error',
          batchId,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        createdAt: admin.firestore.Timestamp.now()
      })
      
      throw error
    }
  })