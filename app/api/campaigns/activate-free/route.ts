import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyIdToken } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await verifyIdToken(token)
    const userId = decodedToken.uid

    // Get request body
    const { campaignId } = await request.json()

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    // Check if user is blocked
    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (userDoc.exists) {
      const userData = userDoc.data()
      if (userData?.isBlocked === true) {
        return NextResponse.json(
          { error: 'Your account has been blocked. You cannot activate campaigns at this time.' },
          { status: 403 }
        )
      }
    }

    // Check if user has already used their free campaign
    const freeCampaignUsed = userDoc.exists ? userDoc.data()?.freeCampaignUsed : false
    if (freeCampaignUsed) {
      return NextResponse.json(
        { error: 'You have already used your free campaign' },
        { status: 400 }
      )
    }

    // Check if free campaigns are enabled
    const settingsDoc = await adminDb.collection('settings').doc('system').get()
    if (settingsDoc.exists) {
      const settings = settingsDoc.data()
      if (settings?.freeCampaignEnabled === false) {
        return NextResponse.json(
          { error: 'Free campaigns are currently disabled' },
          { status: 400 }
        )
      }
    }

    // Verify campaign ownership
    const campaignDoc = await adminDb.collection('campaigns').doc(campaignId).get()
    if (!campaignDoc.exists) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const campaignData = campaignDoc.data()
    if (campaignData?.createdBy !== userId) {
      return NextResponse.json(
        { error: 'You do not own this campaign' },
        { status: 403 }
      )
    }

    // Calculate expiry date (30 days from now)
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)

    // Update campaign with admin privileges
    await adminDb.collection('campaigns').doc(campaignId).update({
      isFreeCampaign: true,
      planType: 'free',
      amountPaid: 0,
      paymentId: null,
      expiresAt: expiryDate,
      isActive: true,
      status: 'Active',
      lastPaymentAt: new Date()
    })

    // Update user document to mark free campaign as used
    if (userDoc.exists) {
      await adminDb.collection('users').doc(userId).update({
        freeCampaignUsed: true
      })
    } else {
      // Create user document if it doesn't exist
      await adminDb.collection('users').doc(userId).set({
        uid: userId,
        email: decodedToken.email || '',
        freeCampaignUsed: true,
        createdAt: new Date()
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Free campaign activated successfully',
      expiresAt: expiryDate.toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to activate free campaign' },
      { status: 500 }
    )
  }
}
