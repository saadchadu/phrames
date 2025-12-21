import { NextRequest, NextResponse } from 'next/server'
import { getCampaignSupporterStats } from '@/lib/supporters'

export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    const stats = await getCampaignSupporterStats(campaignId)

    return NextResponse.json(stats)

  } catch (error: any) {
    console.error('Error getting supporter stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}