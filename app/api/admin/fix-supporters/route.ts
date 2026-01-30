import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/admin-auth'
import { fixAllCampaignsSupportersCount, cleanupOrphanedSupporters, recalculateSupportersCount } from '@/lib/supporters'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAccess(request)
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, campaignId } = body

    switch (action) {
      case 'fix-all':
        const fixAllResult = await fixAllCampaignsSupportersCount()
        return NextResponse.json(fixAllResult)

      case 'fix-single':
        if (!campaignId) {
          return NextResponse.json(
            { error: 'Campaign ID is required for single fix' },
            { status: 400 }
          )
        }
        const fixSingleResult = await recalculateSupportersCount(campaignId)
        return NextResponse.json(fixSingleResult)

      case 'cleanup-orphaned':
        const cleanupResult = await cleanupOrphanedSupporters()
        return NextResponse.json(cleanupResult)

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: fix-all, fix-single, or cleanup-orphaned' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Error in fix supporters API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}