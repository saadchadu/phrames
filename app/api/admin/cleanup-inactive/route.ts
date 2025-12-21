import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const idToken = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    
    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    const isAdminEmail = adminEmails.includes(decodedToken.email || '')
    const hasAdminClaim = decodedToken.isAdmin === true
    
    if (!isAdminEmail && !hasAdminClaim) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get request parameters
    const body = await request.json().catch(() => ({}))
    const { 
      dryRun = false, 
      sendReminders = true, 
      deleteExpired = true 
    } = body

    console.log('🧹 Manual inactive campaign cleanup triggered by admin:', decodedToken.uid)
    console.log('Parameters:', { dryRun, sendReminders, deleteExpired })

    // Implement cleanup logic directly here
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
    
    // Get inactive campaigns older than 30 days
    const inactiveCampaignsQuery = adminDb.collection('campaigns')
      .where('isActive', '==', false)
      .where('status', '==', 'Inactive')
    
    const inactiveCampaigns = await inactiveCampaignsQuery.get()
    
    let processedCount = 0
    let deletedCount = 0
    
    for (const doc of inactiveCampaigns.docs) {
      const campaign = doc.data()
      const createdAt = campaign.createdAt?.toDate() || new Date()
      
      if (createdAt < thirtyDaysAgo) {
        processedCount++
        
        if (!dryRun && deleteExpired) {
          // Delete the campaign
          await doc.ref.delete()
          deletedCount++
          
          // Log the deletion
          await adminDb.collection('logs').add({
            eventType: 'campaign_deletion',
            actorId: decodedToken.uid,
            description: `Deleted inactive campaign: ${campaign.campaignName}`,
            metadata: {
              campaignId: doc.id,
              campaignName: campaign.campaignName,
              userId: campaign.createdBy,
              reason: 'inactive_cleanup',
              daysInactive: Math.floor((now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000))
            },
            createdAt: now
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Inactive campaign cleanup completed successfully`,
      results: {
        processed: processedCount,
        deleted: dryRun ? 0 : deletedCount,
        dryRun
      },
      parameters: { dryRun, sendReminders, deleteExpired },
      executedBy: decodedToken.uid,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Manual inactive campaign cleanup failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Cleanup failed', 
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}