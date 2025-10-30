import { NextRequest, NextResponse } from 'next/server'
import { firestoreHelpers } from '@/lib/firestore'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Get campaign by slug
    const campaign = await firestoreHelpers.getCampaignBySlug(slug)

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Only return public campaigns
    if (campaign.visibility !== 'public') {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Increment visit count
    const today = new Date().toISOString().split('T')[0]
    await firestoreHelpers.incrementCampaignMetric(campaign.id, today, 'visit')

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error fetching public campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}