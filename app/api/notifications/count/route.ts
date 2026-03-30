import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

const db = adminDb

export async function GET(request: NextRequest) {
  try {
    // Get authorization token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.split('Bearer ')[1]
    
    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid

    // Get unread count
    const unreadQuery = await db.collection('notifications')
      .where('userId', '==', userId)
      .where('isRead', '==', false)
      .get()

    return NextResponse.json({
      unreadCount: unreadQuery.size
    })

  } catch (error: any) {
    console.error('Error getting notification count:', error)
    return NextResponse.json(
      { error: 'Failed to get notification count' },
      { status: 500 }
    )
  }
}