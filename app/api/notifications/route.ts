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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : 50

    // Build query
    let query = db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)

    if (unreadOnly) {
      query = db.collection('notifications')
        .where('userId', '==', userId)
        .where('isRead', '==', false)
        .orderBy('createdAt', 'desc')
        .limit(limit)
    }

    const querySnapshot = await query.get()
    
    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString(),
      expiresAt: doc.data().expiresAt?.toDate()?.toISOString()
    }))

    return NextResponse.json({
      notifications,
      count: notifications.length,
      hasMore: notifications.length === limit
    })

  } catch (error: any) {
    console.error('Error getting notifications:', error)
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    const { notificationId, action } = await request.json()

    if (action === 'markAsRead') {
      if (notificationId) {
        // Mark specific notification as read
        const notificationRef = db.collection('notifications').doc(notificationId)
        const notificationDoc = await notificationRef.get()
        
        if (!notificationDoc.exists) {
          return NextResponse.json(
            { error: 'Notification not found' },
            { status: 404 }
          )
        }
        
        const notificationData = notificationDoc.data()!
        if (notificationData.userId !== userId) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 403 }
          )
        }
        
        await notificationRef.update({ isRead: true })
        
        return NextResponse.json({ success: true })
      } else {
        // Mark all notifications as read
        const unreadQuery = await db.collection('notifications')
          .where('userId', '==', userId)
          .where('isRead', '==', false)
          .get()
        
        const batch = db.batch()
        unreadQuery.docs.forEach(doc => {
          batch.update(doc.ref, { isRead: true })
        })
        
        await batch.commit()
        
        return NextResponse.json({ 
          success: true, 
          updatedCount: unreadQuery.size 
        })
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership and delete
    const notificationRef = db.collection('notifications').doc(notificationId)
    const notificationDoc = await notificationRef.get()
    
    if (!notificationDoc.exists) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }
    
    const notificationData = notificationDoc.data()!
    if (notificationData.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    await notificationRef.delete()
    
    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}