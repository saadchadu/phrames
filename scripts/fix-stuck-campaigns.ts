/**
 * Find and fix campaigns that have successful payments but are not activated
 * Usage: npx ts-node -r tsconfig-paths/register scripts/fix-stuck-campaigns.ts [--dry-run]
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'

// Calculate expiry date inline
function calculateExpiryDate(planType: string): Date {
  const daysMap: { [key: string]: number } = {
    free: 30,
    week: 7,
    month: 30,
    '3month': 90,
    '6month': 180,
    year: 365
  }
  const days = daysMap[planType] || 30
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + days)
  return expiryDate
}

dotenv.config({ path: '.env.local' })

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

interface StuckCampaign {
  campaignId: string
  campaignName: string
  paymentId: string
  orderId: string
  amount: number
  planType: string
  userId: string
  paymentDate: Date
}

async function findStuckCampaigns(): Promise<StuckCampaign[]> {
  console.log('\n🔍 Searching for stuck campaigns...\n')
  
  const stuckCampaigns: StuckCampaign[] = []
  
  try {
    // Get all successful payments
    const paymentsSnapshot = await db.collection('payments')
      .where('status', '==', 'success')
      .get()
    
    console.log(`Found ${paymentsSnapshot.size} successful payments\n`)
    
    for (const paymentDoc of paymentsSnapshot.docs) {
      const payment = paymentDoc.data()
      const campaignId = payment.campaignId
      
      // Get campaign
      const campaignDoc = await db.collection('campaigns').doc(campaignId).get()
      
      if (!campaignDoc.exists) {
        console.log(`⚠️  Campaign ${campaignId} not found (payment ${paymentDoc.id})`)
        continue
      }
      
      const campaign = campaignDoc.data()!
      
      // Check if campaign is inactive despite successful payment
      if (!campaign.isActive || campaign.status !== 'Active') {
        stuckCampaigns.push({
          campaignId,
          campaignName: campaign.campaignName,
          paymentId: paymentDoc.id,
          orderId: payment.orderId,
          amount: payment.amount,
          planType: payment.planType,
          userId: payment.userId,
          paymentDate: payment.completedAt?.toDate() || payment.createdAt?.toDate()
        })
      }
    }
    
    return stuckCampaigns
  } catch (error: any) {
    console.error('Error finding stuck campaigns:', error.message)
    return []
  }
}

async function fixCampaign(stuck: StuckCampaign, dryRun: boolean): Promise<boolean> {
  try {
    console.log(`\n📝 ${dryRun ? '[DRY RUN]' : 'Fixing'} Campaign: ${stuck.campaignName}`)
    console.log(`   Campaign ID: ${stuck.campaignId}`)
    console.log(`   Payment ID: ${stuck.paymentId}`)
    console.log(`   Order ID: ${stuck.orderId}`)
    console.log(`   Amount: ₹${stuck.amount}`)
    console.log(`   Plan: ${stuck.planType}`)
    console.log(`   Payment Date: ${stuck.paymentDate.toLocaleString()}`)
    
    // Check if user is blocked
    const userDoc = await db.collection('users').doc(stuck.userId).get()
    if (userDoc.exists) {
      const userData = userDoc.data()
      if (userData?.isBlocked === true) {
        console.log(`   ❌ User is blocked - skipping`)
        return false
      }
    }
    
    if (dryRun) {
      console.log(`   ✅ Would activate this campaign`)
      return true
    }
    
    // Calculate expiry date
    const expiryDate = calculateExpiryDate(stuck.planType as any)
    
    // Update campaign
    const campaignRef = db.collection('campaigns').doc(stuck.campaignId)
    await campaignRef.update({
      isActive: true,
      status: 'Active',
      isFreeCampaign: false,
      planType: stuck.planType,
      amountPaid: stuck.amount,
      paymentId: stuck.orderId,
      expiresAt: expiryDate ? Timestamp.fromDate(expiryDate) : null,
      lastPaymentAt: Timestamp.now()
    })
    
    // Create log
    await db.collection('logs').add({
      eventType: 'campaign_manually_activated',
      actorId: 'system',
      description: `Campaign manually activated via fix-stuck-campaigns script`,
      metadata: {
        campaignId: stuck.campaignId,
        campaignName: stuck.campaignName,
        paymentId: stuck.paymentId,
        orderId: stuck.orderId,
        amount: stuck.amount,
        planType: stuck.planType,
        userId: stuck.userId,
        expiresAt: expiryDate ? expiryDate.toISOString() : null
      },
      createdAt: Timestamp.now()
    })
    
    console.log(`   ✅ Campaign activated successfully!`)
    console.log(`   Expires: ${expiryDate ? expiryDate.toLocaleString() : 'Never'}`)
    
    return true
  } catch (error: any) {
    console.error(`   ❌ Error fixing campaign: ${error.message}`)
    return false
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  
  console.log('\n' + '='.repeat(70))
  console.log('🔧 FIX STUCK CAMPAIGNS TOOL')
  console.log('='.repeat(70))
  
  if (dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No changes will be made\n')
  } else {
    console.log('\n⚠️  LIVE MODE - Campaigns will be activated\n')
  }
  
  // Find stuck campaigns
  const stuckCampaigns = await findStuckCampaigns()
  
  if (stuckCampaigns.length === 0) {
    console.log('✅ No stuck campaigns found! All payments are properly activated.\n')
    return
  }
  
  console.log(`\n❌ Found ${stuckCampaigns.length} stuck campaign(s):\n`)
  console.log('='.repeat(70))
  
  // Fix each campaign
  let fixed = 0
  let skipped = 0
  let failed = 0
  
  for (const stuck of stuckCampaigns) {
    const success = await fixCampaign(stuck, dryRun)
    if (success) {
      fixed++
    } else {
      skipped++
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(70))
  console.log('📊 SUMMARY')
  console.log('='.repeat(70))
  console.log(`Total stuck campaigns: ${stuckCampaigns.length}`)
  console.log(`${dryRun ? 'Would fix' : 'Fixed'}: ${fixed}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Failed: ${failed}`)
  
  if (dryRun) {
    console.log('\n💡 Run without --dry-run to actually fix these campaigns')
  } else {
    console.log('\n✅ All stuck campaigns have been processed!')
  }
  
  console.log('='.repeat(70) + '\n')
}

main().then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
