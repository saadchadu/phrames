import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  // Rate limit: 30 supporter adds per minute per IP to prevent count inflation
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
  if (!checkRateLimit(ip, { name: 'supporters-add', limit: 30, windowMs: 60 * 1000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const { campaignId, userId, userEmail, sessionId } = body

    if (!campaignId || typeof campaignId !== 'string' || campaignId.length > 128) {
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

    const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

    // Check if already supported using Admin SDK
    const supportersRef = adminDb.collection('supporters')
    let existingQuery

    if (userId) {
      existingQuery = supportersRef
        .where('campaignId', '==', campaignId)
        .where('userId', '==', userId)
    } else {
      existingQuery = supportersRef
        .where('campaignId', '==', campaignId)
        .where('sessionId', '==', finalSessionId)
    }

    const existingSnapshot = await existingQuery.get()
    
    if (!existingSnapshot.empty) {
      // Update existing supporter record
      const existingDoc = existingSnapshot.docs[0]
      await existingDoc.ref.update({
        downloadCount: FieldValue.increment(1),
        lastDownloadAt: FieldValue.serverTimestamp()
      })
      
      return NextResponse.json({
        success: true,
        isNewSupporter: false
      })
    }

    // Use transaction to ensure atomicity
    const result = await adminDb.runTransaction(async (transaction) => {
      // Get campaign document
      const campaignRef = adminDb.collection('campaigns').doc(campaignId)
      const campaignDoc = await transaction.get(campaignRef)
      
      if (!campaignDoc.exists) {
        throw new Error('Campaign not found')
      }
      
      const campaignData = campaignDoc.data()!
      
      // Check if campaign is active (restored security check)
      if (!campaignData.isActive || campaignData.status !== 'Active') {
        throw new Error('Campaign is not active')
      }
      
      // Create supporter record
      const supporterRef = adminDb.collection('supporters').doc()
      transaction.set(supporterRef, {
        campaignId,
        userId: userId || null,
        userEmail: userEmail || null,
        sessionId: finalSessionId,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        supportedAt: FieldValue.serverTimestamp(),
        downloadCount: 1,
        lastDownloadAt: FieldValue.serverTimestamp()
      })
      
      // Increment campaign supporters count
      transaction.update(campaignRef, {
        supportersCount: FieldValue.increment(1)
      })
      
      return { success: true, isNewSupporter: true }
    })

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Error in add supporter API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}