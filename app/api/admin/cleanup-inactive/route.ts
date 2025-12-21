import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/admin-auth'
import { cleanupInactiveCampaigns } from '@/scripts/cleanup-inactive-campaigns'

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const adminAuth = await verifyAdminAccess(request)
    if (!adminAuth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Get request parameters
    const body = await request.json().catch(() => ({}))
    const { 
      dryRun = false, 
      sendReminders = true, 
      deleteExpired = true 
    } = body

    console.log('🧹 Manual inactive campaign cleanup triggered by admin:', adminAuth.userId)
    console.log('Parameters:', { dryRun, sendReminders, deleteExpired })

    // Set environment variables for the cleanup script
    process.argv = [
      'node',
      'cleanup-inactive-campaigns.ts',
      ...(dryRun ? ['--dry-run'] : []),
      ...(sendReminders ? ['--send-reminders'] : []),
      ...(deleteExpired ? ['--delete-expired'] : []),
      '--verbose'
    ]

    // Run the cleanup
    await cleanupInactiveCampaigns()

    return NextResponse.json({
      success: true,
      message: 'Inactive campaign cleanup completed successfully',
      parameters: { dryRun, sendReminders, deleteExpired },
      executedBy: adminAuth.userId,
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