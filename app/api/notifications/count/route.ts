import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

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
    const decodedToken = await getAuth().verifyIdToken(token)
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