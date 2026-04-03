import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  // Rate limit: 20 requests per minute per IP to prevent username enumeration
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
  if (!checkRateLimit(ip, { name: 'check-username', limit: 20, windowMs: 60 * 1000 })) {
    return NextResponse.json({ available: false, error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json(
        { available: false, error: 'Username is required' },
        { status: 400 }
      )
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { 
          available: false, 
          error: 'Username must be 3-20 characters, lowercase letters, numbers, and underscores only' 
        },
        { status: 400 }
      )
    }

    // Get the authenticated user's UID from the token (never trust body for this)
    let currentUid: string | null = null
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1])
        currentUid = decoded.uid
      } catch { /* unauthenticated — that's fine for availability checks */ }
    }

    // Check if username exists
    const usersRef = adminDb.collection('users')
    const snapshot = await usersRef.where('username', '==', username).limit(1).get()

    if (snapshot.empty) {
      return NextResponse.json({ available: true })
    }

    // If username exists, check if it belongs to the authenticated user
    const existingUser = snapshot.docs[0]
    if (currentUid && existingUser.id === currentUid) {
      return NextResponse.json({ available: true })
    }

    return NextResponse.json({ available: false, error: 'Username is already taken' })
  } catch (error) {
    return NextResponse.json(
      { available: false, error: 'Error checking username availability' },
      { status: 500 }
    )
  }
}
