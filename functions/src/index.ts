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

// Email template generation (simplified version for Cloud Functions)
interface EmailTemplate {
  subject: string
  htmlBody: string
  textBody: string
}

function generateCampaignReminderEmail(
  campaignName: string, 
  campaignSlug: string, 
  daysUntilDeletion: number, 
  userName?: string
): EmailTemplate {
  const greeting = userName ? `Hi ${userName}` : 'Hello'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://phrames.com'
  const campaignUrl = `${baseUrl}/campaign/${campaignSlug}`
  
  const subject = daysUntilDeletion === 0 
    ? `Your campaign "${campaignName}" has been deleted due to inactivity`
    : `Reminder: Your campaign "${campaignName}" will be deleted in ${daysUntilDeletion} days`

  const htmlBody = daysUntilDeletion === 0 
    ? `<p>${greeting},</p><p>Your campaign "${campaignName}" has been deleted due to 30 days of inactivity.</p>`
    : `<p>${greeting},</p><p>Your campaign "${campaignName}" will be deleted in ${daysUntilDeletion} days due to inactivity.</p><p><a href="${campaignUrl}">View Campaign</a></p>`

  const textBody = daysUntilDeletion === 0
    ? `${greeting}, Your campaign "${campaignName}" has been deleted due to 30 days of inactivity.`
    : `${greeting}, Your campaign "${campaignName}" will be deleted in ${daysUntilDeletion} days due to inactivity. View: ${campaignUrl}`

  return { subject, htmlBody, textBody }
}

async function logEmailSent(
  userId: string, 
  email: string, 
  type: 'reminder' | 'deletion_notice',
  campaignId: string,
  daysUntilDeletion?: number
): Promise<void> {
  try {
    await db.collection('emailLogs').add({
      userId,
      email,
      type,
      campaignId,
      daysUntilDeletion: daysUntilDeletion || 0,
      sentAt: admin.firestore.Timestamp.now(),
      status: 'logged' // In real implementation, integrate with email service
    })
  } catch (error) {
    console.error('Failed to log email:', error)
  }
}

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
        description: 'Campaign expiry cron job started',
        metadata: {
          cronType: 'campaign_expiry',
          batchId,
          startTime: new Date(startTime).toISOString()
        },
        createdAt: now
      })
      
      // Query expired campaigns (including free campaigns)
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
        
        // Create admin log for successful completion
        await db.collection('logs').add({
          eventType: 'cron_execution',
          actorId: 'system',
          description: 'Campaign expiry cron job completed successfully',
          metadata: {
            cronType: 'campaign_expiry',
            result: 'success',
            batchId,
            campaignsProcessed: 0,
            duration
          },
          createdAt: admin.firestore.Timestamp.now()
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
      await db.collection('expiryLogs').doc(batchId).set({
        type: 'batch_summary',
        batchId,
        totalProcessed: count,
        processedAt: now,
        timestamp: now,
        duration,
        campaignIds: campaignIds.slice(0, 100) // Store first 100 IDs
      })
      
      // Create admin log for successful completion
      await db.collection('logs').add({
        eventType: 'cron_execution',
        actorId: 'system',
        description: `Campaign expiry cron job completed successfully - processed ${count} campaigns`,
        metadata: {
          cronType: 'campaign_expiry',
          result: 'success',
          batchId,
          campaignsProcessed: count,
          duration,
          campaigns: expiredCampaignDetails.slice(0, 10) // Store first 10 for reference
        },
        createdAt: admin.firestore.Timestamp.now()
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
      
      // Create admin log for failure
      await db.collection('logs').add({
        eventType: 'cron_execution',
        actorId: 'system',
        description: 'Campaign expiry cron job failed',
        metadata: {
          cronType: 'campaign_expiry',
          result: 'failure',
          batchId,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          duration
        },
        createdAt: admin.firestore.Timestamp.now()
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
    
    // Query expired campaigns (including free campaigns)
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

/**
 * Scheduled function that runs daily to cleanup inactive campaigns
 * Sends reminders at 7, 3, 1 days before deletion and deletes after 30 days
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
      
      // Get all active campaigns
      const campaignsSnapshot = await db.collection('campaigns')
        .where('isActive', '==', true)
        .where('status', '==', 'Active')
        .get()
      
      console.log(`🧹 INFO [inactive_cleanup] Found ${campaignsSnapshot.size} active campaigns to analyze`)
      
      if (campaignsSnapshot.empty) {
        const duration = Date.now() - startTime
        console.log('🧹 INFO [inactive_cleanup_completed] No active campaigns to process', { duration, batchId })
        
        await db.collection('logs').add({
          eventType: 'cron_execution',
          actorId: 'system',
          description: 'Inactive campaign cleanup completed - no campaigns to process',
          metadata: {
            cronType: 'inactive_campaign_cleanup',
            result: 'success',
            batchId,
            campaignsAnalyzed: 0,
            remindersSent: 0,
            campaignsDeleted: 0,
            duration
          },
          createdAt: admin.firestore.Timestamp.now()
        })
        
        return null
      }
      
      const REMINDER_DAYS = [7, 3, 1]
      const DELETION_THRESHOLD_DAYS = 30
      const currentDate = new Date()
      
      let remindersSent = 0
      let campaignsDeleted = 0
      let errors: string[] = []
      
      // Process each campaign
      for (const doc of campaignsSnapshot.docs) {
        try {
          const campaign = doc.data()
          const campaignId = doc.id
          
          // Determine last activity date
          let lastActivityAt = campaign.createdAt?.toDate() || new Date()
          
          // Check for more recent activity in stats
          try {
            const statsQuery = await db.collection('CampaignStatsDaily')
              .where('campaignId', '==', campaignId)
              .orderBy('date', 'desc')
              .limit(1)
              .get()
            
            if (!statsQuery.empty) {
              const latestStat = statsQuery.docs[0].data()
              const statDate = new Date(latestStat.date + 'T00:00:00Z')
              if (statDate > lastActivityAt) {
                lastActivityAt = statDate
              }
            }
          } catch (statsError) {
            console.warn(`Could not fetch stats for campaign ${campaignId}:`, statsError)
          }
          
          // Calculate days inactive
          const daysInactive = Math.floor((currentDate.getTime() - lastActivityAt.getTime()) / (1000 * 60 * 60 * 24))
          
          // Skip if not inactive long enough
          if (daysInactive < 20) continue
          
          const daysUntilDeletion = DELETION_THRESHOLD_DAYS - daysInactive
          
          // Check if campaign should be deleted
          if (daysInactive >= DELETION_THRESHOLD_DAYS) {
            console.log(`🗑️ Deleting campaign ${campaignId} (${daysInactive} days inactive)`)
            
            // Get user info for notification
            let userEmail = campaign.createdByEmail
            let userName: string | undefined
            
            if (!userEmail) {
              const userDoc = await db.collection('users').doc(campaign.createdBy).get()
              if (userDoc.exists()) {
                const userData = userDoc.data()!
                userEmail = userData.email
                userName = userData.displayName || userData.username
              }
            }
            
            // Get user info for notification
            let userEmail = campaign.createdByEmail
            let userName: string | undefined
            
            if (!userEmail) {
              const userDoc = await db.collection('users').doc(campaign.createdBy).get()
              if (userDoc.exists()) {
                const userData = userDoc.data()!
                userEmail = userData.email
                userName = userData.displayName || userData.username
              }
            }
            
            // Create deletion notification
            try {
              const { createCampaignDeletedNotification } = await import('../lib/notifications')
              
              await createCampaignDeletedNotification(
                campaign.createdBy,
                campaign.campaignName || 'Untitled Campaign',
                '30 days of inactivity'
              )
              
              console.log(`📧 Deletion notification created for user ${campaign.createdBy}`)
            } catch (notificationError) {
              console.warn(`Failed to create deletion notification for ${campaignId}:`, notificationError)
            }
            
            // Delete campaign
            await db.collection('campaigns').doc(campaignId).delete()
            
            // Delete related stats
            const statsQuery = await db.collection('CampaignStatsDaily')
              .where('campaignId', '==', campaignId)
              .get()
            
            const batch = db.batch()
            statsQuery.docs.forEach(statDoc => {
              batch.delete(statDoc.ref)
            })
            await batch.commit()
            
            // Create admin log for deletion
            await db.collection('logs').add({
              eventType: 'campaign_deleted',
              actorId: 'system',
              description: `Campaign "${campaign.campaignName || 'Untitled'}" deleted due to ${daysInactive} days of inactivity`,
              metadata: {
                campaignId,
                campaignName: campaign.campaignName || 'Untitled Campaign',
                slug: campaign.slug,
                userId: campaign.createdBy,
                daysInactive,
                lastActivityAt: lastActivityAt.toISOString(),
                reason: 'inactivity_cleanup',
                batchId
              },
              createdAt: admin.firestore.Timestamp.now()
            })
            
            campaignsDeleted++
            
          } else if (REMINDER_DAYS.includes(daysUntilDeletion)) {
            // Send reminder email
            console.log(`📧 Sending reminder for campaign ${campaignId} (${daysUntilDeletion} days until deletion)`)
            
            try {
              // Create dashboard notification instead of email
              const { createCampaignDeletionWarning } = await import('../lib/notifications')
              
              const notificationId = await createCampaignDeletionWarning(
                campaign.createdBy,
                campaignId,
                campaign.campaignName || 'Untitled Campaign',
                daysUntilDeletion
              )
              
              if (notificationId) {
                // Create admin log for reminder
                await db.collection('logs').add({
                  eventType: 'campaign_reminder_sent',
                  actorId: 'system',
                  description: `Dashboard notification created for campaign "${campaign.campaignName || 'Untitled'}" (${daysUntilDeletion} days remaining)`,
                  metadata: {
                    campaignId,
                    campaignName: campaign.campaignName || 'Untitled Campaign',
                    userId: campaign.createdBy,
                    daysUntilDeletion,
                    daysInactive,
                    notificationId,
                    notificationType: 'dashboard',
                    batchId
                  },
                  createdAt: admin.firestore.Timestamp.now()
                })
                
                remindersSent++
                console.log(`📧 Dashboard notification created for user ${campaign.createdBy}`)
              } else {
                throw new Error('Failed to create dashboard notification')
              }
            } catch (notificationError) {
              const errorMsg = `Failed to create notification for ${campaignId}: ${notificationError}`
              errors.push(errorMsg)
              console.error(errorMsg)
            }
          }
          
        } catch (campaignError) {
          const errorMsg = `Error processing campaign ${doc.id}: ${campaignError}`
          errors.push(errorMsg)
          console.error(errorMsg)
        }
      }
      
      const duration = Date.now() - startTime
      
      // Log cleanup summary
      await db.collection('cleanupLogs').add({
        type: 'inactive_campaign_cleanup',
        batchId,
        stats: {
          totalCampaigns: campaignsSnapshot.size,
          remindersSent,
          campaignsDeleted,
          errors: errors.length,
          errorMessages: errors
        },
        executedAt: admin.firestore.Timestamp.now(),
        duration
      })
      
      // Create final admin log
      await db.collection('logs').add({
        eventType: 'cron_execution',
        actorId: 'system',
        description: 'Inactive campaign cleanup cron job completed',
        metadata: {
          cronType: 'inactive_campaign_cleanup',
          result: errors.length > 0 ? 'partial_success' : 'success',
          batchId,
          campaignsAnalyzed: campaignsSnapshot.size,
          remindersSent,
          campaignsDeleted,
          errors: errors.length,
          duration
        },
        createdAt: admin.firestore.Timestamp.now()
      })
      
      console.log(`🧹 INFO [inactive_cleanup_completed] Cleanup completed`, {
        batchId,
        campaignsAnalyzed: campaignsSnapshot.size,
        remindersSent,
        campaignsDeleted,
        errors: errors.length,
        duration
      })
      
      return null
      
    } catch (error: any) {
      const duration = Date.now() - startTime
      console.error('🧹 ERROR [inactive_cleanup_failed] Cleanup failed:', error)
      
      // Log failure
      await db.collection('logs').add({
        eventType: 'cron_execution',
        actorId: 'system',
        description: `Inactive campaign cleanup cron job failed: ${error.message}`,
        metadata: {
          cronType: 'inactive_campaign_cleanup',
          result: 'failure',
          batchId,
          error: error.message,
          stack: error.stack,
          duration
        },
        createdAt: admin.firestore.Timestamp.now()
      })
      
      throw error
    }
  })

/**
 * Manual trigger for inactive campaign cleanup (for testing)
 */
export const manualInactiveCampaignCleanup = functions.https.onRequest(async (req, res) => {
  // Verify API key
  const apiKey = req.headers['x-api-key'] || req.query.apiKey
  if (apiKey !== process.env.CRON_API_KEY) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  
  try {
    console.log('🧹 Manual inactive campaign cleanup triggered')
    
    // Call the same logic as the scheduled function
    await scheduledInactiveCampaignCleanup.run({} as any, {} as any)
    
    res.json({ 
      success: true, 
      message: 'Inactive campaign cleanup completed',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Manual inactive campaign cleanup failed:', error)
    res.status(500).json({ 
      error: 'Cleanup failed', 
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
})