import { NextRequest, NextResponse } from 'next/server'
import { getUserAggregateStats, getUserDailyStats } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const days = parseInt(searchParams.get('days') || '30')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get aggregate stats
    const aggregateStats = await getUserAggregateStats(userId)
    
    // Get daily stats
    const dailyStats = await getUserDailyStats(userId, days)
    
    // Calculate conversion rate
    const conversionRate = aggregateStats.visits > 0 
      ? (aggregateStats.downloads / aggregateStats.visits) * 100 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        totalVisits: aggregateStats.visits,
        totalDownloads: aggregateStats.downloads,
        conversionRate,
        dailyStats
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
