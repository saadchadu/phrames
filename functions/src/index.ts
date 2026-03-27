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
import * as https from 'https'

// Initialize Firebase Admin
admin.initializeApp()

const db = admin.firestore()

// ─── Resend email helper (no extra deps) ─────────────────────────────────────
function sendResendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'Phrames <support@cleffon.com>'
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set, skipping email to', to)
    return Promise.resolve()
  }
  const body = JSON.stringify({ from, to, subject, html })
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          console.error('[email] Resend error:', data)
          reject(new Error(`Resend HTTP ${res.statusCode}: ${data}`))
        } else {
          resolve()
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://phrames.cleffon.com'

function emailBase(content: string, accentColor = '#00dd78') {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f0f2f0;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
<tr><td style="background:#002400;border-radius:16px 16px 0 0;padding:24px 32px;">
  <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">Phrames</span>
</td></tr>
<tr><td style="background:${accentColor};height:3px;"></td></tr>
<tr><td style="background:#fff;padding:32px 36px;">${content}</td></tr>
<tr><td style="background:#fafafa;border-radius:0 0 16px 16px;padding:16px 36px;border-top:1px solid #eee;">
  <span style="color:#aaa;font-size:12px;">© ${new Date().getFullYear()} Phrames · support@cleffon.com</span>
</td></tr>
</table></td></tr></table></body></html>`
}

function emailBtn(text: string, url: string) {
  return `<a href="${url}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#002400;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">${text}</a>`
}

async function sendExpiryWarningEmail(userEmail: string, userName: string, campaignName: string, campaignSlug: string, daysLeft: number, expiresAt: string) {
  const isUrgent = daysLeft <= 1
  const accent = isUrgent ? '#ff6b35' : '#f6ad55'
  const html = emailBase(`
    <h2 style="margin:0 0 10px;color:#002400;font-size:22px;font-weight:700;">Your campaign expires ${isUrgent ? 'tomorrow' : `in ${daysLeft} days`}</h2>
    <p style="color:#666;font-size:15px;line-height:1.6;">Hi ${userName}, your campaign <strong>${campaignName}</strong> will expire on <strong>${expiresAt}</strong>. Renew now to keep it live.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faf8;border-radius:10px;padding:4px 16px;margin-top:16px;">
      <tr><td style="padding:8px 0;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0;">Campaign</td><td style="padding:8px 0;color:#002400;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;">${campaignName}</td></tr>
      <tr><td style="padding:8px 0;color:#888;font-size:13px;">Days Remaining</td><td style="padding:8px 0;color:${isUrgent ? '#c0392b' : '#002400'};font-weight:700;font-size:13px;text-align:right;">${daysLeft} day${daysLeft !== 1 ? 's' : ''}</td></tr>
    </table>
    ${emailBtn('Renew Campaign', `${APP_URL}/campaign/${campaignSlug}`)}
  `, accent)
  return sendResendEmail(userEmail, `${isUrgent ? '🚨' : '⏰'} Your campaign "${campaignName}" expires ${isUrgent ? 'tomorrow' : `in ${daysLeft} days`}`, html)
}

async function sendExpiredEmail(userEmail: string, userName: string, campaignName: string, campaignSlug: string) {
  const html = emailBase(`
    <h2 style="margin:0 0 10px;color:#002400;font-size:22px;font-weight:700;">Your campaign has expired</h2>
    <p style="color:#666;font-size:15px;line-height:1.6;">Hi ${userName}, your campaign <strong>${campaignName}</strong> has expired and is no longer visible to the public.</p>
    <div style="background:#f8faf8;border-left:3px solid #00dd78;border-radius:0 8px 8px 0;padding:12px 16px;margin-top:16px;color:#555;font-size:14px;">
      Your campaign data is safe. Renewing will restore it immediately.
    </div>
    ${emailBtn('Renew Campaign', `${APP_URL}/campaign/${campaignSlug}`)}
  `, '#ff6b6b')
  return sendResendEmail(userEmail, `Your campaign "${campaignName}" has expired`, html)
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
        
        // Collect for email sending after batch commit
        if (campaign.createdBy) {
          expiredCampaignDetails[expiredCampaignDetails.length - 1].slug = campaign.slug || doc.id
        }
        
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

      // Send expiry emails to campaign owners (best-effort, don't block on failure)
      for (const detail of expiredCampaignDetails) {
        try {
          if (!detail.userId) continue
          const userDoc = await db.collection('users').doc(detail.userId).get()
          const user = userDoc.data()
          if (user?.email) {
            await sendExpiredEmail(
              user.email,
              user.displayName || user.name || 'there',
              detail.name || 'Your Campaign',
              detail.slug || detail.id
            )
          }
        } catch (emailErr) {
          console.error(`[email] Failed to send expiry email for campaign ${detail.id}:`, emailErr)
        }
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

/**
 * Scheduled function that runs daily to send expiry warning emails
 * Sends warnings at 7 days and 1 day before campaign expiry
 */
export const scheduledCampaignExpiryWarnings = functions.pubsub
  .schedule('0 8 * * *') // Run daily at 8 AM UTC
  .timeZone('UTC')
  .onRun(async () => {
    const now = new Date()

    // Calculate the two warning windows: exactly 7 days and 1 day from now
    const targets = [
      { daysLeft: 7, label: '7-day' },
      { daysLeft: 1, label: '1-day' },
    ]

    for (const { daysLeft, label } of targets) {
      const windowStart = new Date(now)
      windowStart.setDate(windowStart.getDate() + daysLeft)
      windowStart.setHours(0, 0, 0, 0)

      const windowEnd = new Date(windowStart)
      windowEnd.setHours(23, 59, 59, 999)

      const campaigns = await db.collection('campaigns')
        .where('isActive', '==', true)
        .where('expiresAt', '>=', admin.firestore.Timestamp.fromDate(windowStart))
        .where('expiresAt', '<=', admin.firestore.Timestamp.fromDate(windowEnd))
        .get()

      console.log(`[expiry_warning] ${label}: found ${campaigns.size} campaigns`)

      for (const doc of campaigns.docs) {
        const campaign = doc.data()
        if (!campaign.createdBy) continue
        try {
          const userDoc = await db.collection('users').doc(campaign.createdBy).get()
          const user = userDoc.data()
          if (!user?.email) continue
          const expiresDate = campaign.expiresAt?.toDate()
          const expiresAt = expiresDate
            ? expiresDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'soon'
          await sendExpiryWarningEmail(
            user.email,
            user.displayName || user.name || 'there',
            campaign.campaignName || 'Your Campaign',
            campaign.slug || doc.id,
            daysLeft,
            expiresAt
          )
          console.log(`[expiry_warning] Sent ${label} warning to ${user.email} for campaign ${doc.id}`)
        } catch (err) {
          console.error(`[expiry_warning] Failed for campaign ${doc.id}:`, err)
        }
      }
    }

    return null
  })
