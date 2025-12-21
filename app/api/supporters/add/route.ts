import { NextRequest, NextResponse } from 'next/server'
import { addSupporter } from '@/lib/supporters'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, userId, userEmail, sessionId } = body

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    // Get client IP and user agent for additional deduplication
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const result = await addSupporter(
      campaignId,
      userId,
      userEmail,
      sessionId,
      ipAddress,
      userAgent
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      isNewSupporter: result.isNewSupporter
    })

  } catch (error: any) {
    console.error('Error in add supporter API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}