#!/usr/bin/env ts-node
/**
 * Cleanup Inactive Campaigns Script
 * 
 * This script identifies and deletes campaigns that have been inactive for 30+ days.
 * It also sends reminder notifications to users before deletion.
 * 
 * Usage:
 *   npm run cleanup-inactive [--dry-run] [--send-reminders] [--delete-expired]
 *   
 * Options:
 *   --dry-run           Show what would be done without actually doing it
 *   --send-reminders    Send reminder notifications (7, 3, 1 days before deletion)
 *   --delete-expired    Delete campaigns that are 30+ days inactive
 *   --verbose           Show detailed information
 * 
 * Examples:
 *   npm run cleanup-inactive --dry-run --verbose
 *   npm run cleanup-inactive --send-reminders
 *   npm run cleanup-inactive --delete-expired
 *   npm run cleanup-inactive --send-reminders --delete-expired
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore'
import { createCampaignDeletionWarning, createCampaignDeletedNotification } from '../lib/notifications'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

interface InactiveCampaign {
  id: string
  campaignName: string
  slug: string
  createdBy: string
  lastActivityAt: Date
  daysInactive: number
  status: string
  isActive: boolean
}

interface CleanupStats {
  totalCampaigns: number
  inactiveCampaigns: number
  remindersToSend: number
  campaignsToDelete: number
  remindersSent: number
  campaignsDeleted: number
  errors: string[]
}

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const sendReminders = args.includes('--send-reminders')
const deleteExpired = args.includes('--delete-expired')
const verbose = args.includes('--verbose')

// Reminder thresholds (days before deletion)
const REMINDER_DAYS = [7, 3, 1]
const DELETION_THRESHOLD_DAYS = 30

async function main() {
  console.log('🧹 Starting inactive campaign cleanup...\n')
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No actual changes will be made\n')
  }
  
  const stats: CleanupStats = {
    totalCampaigns: 0,
    inactiveCampaigns: 0,
    remindersToSend: 0,
    campaignsToDelete: 0,
    remindersSent: 0,
    campaignsDeleted: 0,
    errors: []
  }
  
  try {
    // Get all active campaigns
    const campaignsSnapshot = await db.collection('campaigns')
      .where('isActive', '==', true)
      .where('status', '==', 'Active')
      .get()
    
    stats.totalCampaigns = campaignsSnapshot.size
    console.log(`📊 Found ${stats.totalCampaigns} active campaigns\n`)
    
    if (campaignsSnapshot.empty) {
      console.log('✅ No active campaigns found. Nothing to process.')
      return
    }
    
    // Analyze campaigns for inactivity
    const inactiveCampaigns = await analyzeInactiveCampaigns(campaignsSnapshot.docs)
    stats.inactiveCampaigns = inactiveCampaigns.length
    
    if (verbose) {
      console.log('📋 Inactive campaigns analysis:')
      inactiveCampaigns.forEach(campaign => {
        console.log(`  • ${campaign.campaignName} (${campaign.daysInactive} days inactive)`)
      })
      console.log()
    }
    
    // Categorize campaigns
    const campaignsForReminders = inactiveCampaigns.filter(c => 
      REMINDER_DAYS.includes(DELETION_THRESHOLD_DAYS - c.daysInactive)
    )
    const campaignsForDeletion = inactiveCampaigns.filter(c => 
      c.daysInactive >= DELETION_THRESHOLD_DAYS
    )
    
    stats.remindersToSend = campaignsForReminders.length
    stats.campaignsToDelete = campaignsForDeletion.length
    
    console.log(`📈 Summary:`)
    console.log(`  • Total active campaigns: ${stats.totalCampaigns}`)
    console.log(`  • Inactive campaigns: ${stats.inactiveCampaigns}`)
    console.log(`  • Reminders to send: ${stats.remindersToSend}`)
    console.log(`  • Campaigns to delete: ${stats.campaignsToDelete}\n`)
    
    // Send reminder emails
    if (sendReminders && campaignsForReminders.length > 0) {
      console.log('📧 Sending reminder notifications...')
      for (const campaign of campaignsForReminders) {
        try {
          await sendReminderNotification(campaign, isDryRun)
          stats.remindersSent++
          if (verbose) {
            console.log(`  ✅ Reminder sent for: ${campaign.campaignName}`)
          }
        } catch (error) {
          const errorMsg = `Failed to send reminder for ${campaign.campaignName}: ${error}`
          stats.errors.push(errorMsg)
          console.error(`  ❌ ${errorMsg}`)
        }
      }
      console.log(`📧 Sent ${stats.remindersSent} reminder notifications\n`)
    }
    
    // Delete expired campaigns
    if (deleteExpired && campaignsForDeletion.length > 0) {
      console.log('🗑️  Deleting expired campaigns...')
      for (const campaign of campaignsForDeletion) {
        try {
          await deleteCampaign(campaign, isDryRun)
          stats.campaignsDeleted++
          if (verbose) {
            console.log(`  ✅ Deleted: ${campaign.campaignName}`)
          }
        } catch (error) {
          const errorMsg = `Failed to delete ${campaign.campaignName}: ${error}`
          stats.errors.push(errorMsg)
          console.error(`  ❌ ${errorMsg}`)
        }
      }
      console.log(`🗑️  Deleted ${stats.campaignsDeleted} campaigns\n`)
    }
    
    // Log cleanup summary
    await logCleanupSummary(stats, isDryRun)
    
    // Print final summary
    console.log('✅ Cleanup completed!')
    console.log(`📊 Final stats:`)
    console.log(`  • Reminders sent: ${stats.remindersSent}`)
    console.log(`  • Campaigns deleted: ${stats.campaignsDeleted}`)
    if (stats.errors.length > 0) {
      console.log(`  • Errors: ${stats.errors.length}`)
      stats.errors.forEach(error => console.log(`    - ${error}`))
    }
    
  } catch (error) {
    console.error('❌ Fatal error during cleanup:', error)
    process.exit(1)
  }
}

async function analyzeInactiveCampaigns(campaignDocs: any[]): Promise<InactiveCampaign[]> {
  const now = new Date()
  const inactiveCampaigns: InactiveCampaign[] = []
  
  for (const doc of campaignDocs) {
    const campaign = doc.data()
    
    // Determine last activity date
    let lastActivityAt = campaign.createdAt?.toDate() || new Date()
    
    // Check for more recent activity in stats
    try {
      const statsQuery = await db.collection('CampaignStatsDaily')
        .where('campaignId', '==', doc.id)
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
    } catch (error) {
      // If stats query fails, use creation date
      console.warn(`Could not fetch stats for campaign ${doc.id}:`, error)
    }
    
    // Calculate days inactive
    const daysInactive = Math.floor((now.getTime() - lastActivityAt.getTime()) / (1000 * 60 * 60 * 24))
    
    // Only include campaigns inactive for 20+ days (to catch those approaching deletion)
    if (daysInactive >= 20) {
      inactiveCampaigns.push({
        id: doc.id,
        campaignName: campaign.campaignName || 'Untitled Campaign',
        slug: campaign.slug,
        createdBy: campaign.createdBy,
        lastActivityAt,
        daysInactive,
        status: campaign.status,
        isActive: campaign.isActive
      })
    }
  }
  
  return inactiveCampaigns.sort((a, b) => b.daysInactive - a.daysInactive)
}

async function sendReminderNotification(campaign: InactiveCampaign, isDryRun: boolean): Promise<void> {
  const daysUntilDeletion = DELETION_THRESHOLD_DAYS - campaign.daysInactive
  
  if (!isDryRun) {
    // Create dashboard notification instead of email
    const notificationId = await createCampaignDeletionWarning(
      campaign.createdBy,
      campaign.id,
      campaign.campaignName,
      daysUntilDeletion
    )
    
    if (!notificationId) {
      throw new Error('Failed to create dashboard notification')
    }
    
    // Create admin log
    await db.collection('logs').add({
      eventType: 'campaign_reminder_sent',
      actorId: 'system',
      description: `Dashboard notification created for campaign "${campaign.campaignName}" (${daysUntilDeletion} days remaining)`,
      metadata: {
        campaignId: campaign.id,
        campaignName: campaign.campaignName,
        userId: campaign.createdBy,
        daysUntilDeletion,
        daysInactive: campaign.daysInactive,
        notificationId,
        notificationType: 'dashboard'
      },
      createdAt: Timestamp.now()
    })
  }
}

async function deleteCampaign(campaign: InactiveCampaign, isDryRun: boolean): Promise<void> {
  if (!isDryRun) {
    // Create deletion notification
    await createCampaignDeletedNotification(
      campaign.createdBy,
      campaign.campaignName,
      '30 days of inactivity'
    )
    
    // Delete campaign document
    await db.collection('campaigns').doc(campaign.id).delete()
    
    // Delete related stats (optional - you might want to keep for analytics)
    const statsQuery = await db.collection('CampaignStatsDaily')
      .where('campaignId', '==', campaign.id)
      .get()
    
    const batch = db.batch()
    statsQuery.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    await batch.commit()
    
    // Create admin log
    await db.collection('logs').add({
      eventType: 'campaign_deleted',
      actorId: 'system',
      description: `Campaign "${campaign.campaignName}" deleted due to ${campaign.daysInactive} days of inactivity`,
      metadata: {
        campaignId: campaign.id,
        campaignName: campaign.campaignName,
        slug: campaign.slug,
        userId: campaign.createdBy,
        daysInactive: campaign.daysInactive,
        lastActivityAt: campaign.lastActivityAt.toISOString(),
        reason: 'inactivity_cleanup'
      },
      createdAt: Timestamp.now()
    })
  }
}

async function logCleanupSummary(stats: CleanupStats, isDryRun: boolean): Promise<void> {
  try {
    await db.collection('cleanupLogs').add({
      type: 'inactive_campaign_cleanup',
      isDryRun,
      stats,
      executedAt: Timestamp.now(),
      timestamp: Timestamp.now()
    })
    
    // Create admin log
    await db.collection('logs').add({
      eventType: 'cron_execution',
      actorId: 'system',
      description: `Inactive campaign cleanup completed${isDryRun ? ' (dry run)' : ''}`,
      metadata: {
        cronType: 'inactive_campaign_cleanup',
        isDryRun,
        ...stats
      },
      createdAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Failed to log cleanup summary:', error)
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
}

export { main as cleanupInactiveCampaigns }