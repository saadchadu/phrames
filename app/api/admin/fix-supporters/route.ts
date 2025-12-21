import { NextRequest, NextResponse } from 'next/server'
import { fixAllCampaignsSupportersCount, cleanupOrphanedSupporters, recalculateSupportersCount } from '@/lib/supporters'
import { auth } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const idToken = authHeader.split('Bearer ')[1]
    const decodedToken = await auth.verifyIdToken(idToken)
    
    // Check if user is admin (you'll need to implement admin check)
    // For now, we'll check if user email is in admin list or has admin custom claim
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    const isAdminEmail = adminEmails.includes(decodedToken.email || '')
    const hasAdminClaim = decodedToken.isAdmin === true
    
    if (!isAdminEmail && !hasAdminClaim) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, campaignId } = body

    let result

    switch (action) {
      case 'fix-all':
        result = await fixAllCampaignsSupportersCount()
        break
      
      case 'fix-single':
        if (!campaignId) {
          return NextResponse.json(
            { error: 'Campaign ID required for single fix' },
            { status: 400 }
          )
        }
        result = await recalculateSupportersCount(campaignId)
        break
      
      case 'cleanup-orphaned':
        result = await cleanupOrphanedSupporters()
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Error in fix supporters API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}