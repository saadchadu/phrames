import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyIdToken } from '@/lib/firebase-admin'
import { checkRateLimit } from '@/lib/rateLimit'

export async function PUT(request: NextRequest) {
  // Rate limit: 10 profile updates per minute per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
  if (!checkRateLimit(ip, { name: 'profile-update', limit: 10, windowMs: 60 * 1000 })) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await verifyIdToken(token)
    const userId = decodedToken.uid

    const body = await request.json()
    const { displayName, username, bio, profileImageUrl, location, website } = body

    // Length limits to prevent abuse
    if (displayName !== undefined && displayName.length > 100) {
      return NextResponse.json({ error: 'Display name must be 100 characters or fewer' }, { status: 400 })
    }
    if (bio !== undefined && bio.length > 500) {
      return NextResponse.json({ error: 'Bio must be 500 characters or fewer' }, { status: 400 })
    }
    if (location !== undefined && location.length > 100) {
      return NextResponse.json({ error: 'Location must be 100 characters or fewer' }, { status: 400 })
    }

    // Validate username if provided
    if (username) {
      const usernameRegex = /^[a-z0-9_]{3,20}$/
      if (!usernameRegex.test(username)) {
        return NextResponse.json(
          { error: 'Username must be 3-20 characters, lowercase letters, numbers, and underscores only' },
          { status: 400 }
        )
      }

      // Check username uniqueness
      const usersRef = adminDb.collection('users')
      const snapshot = await usersRef.where('username', '==', username).limit(1).get()
      
      if (!snapshot.empty && snapshot.docs[0].id !== userId) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        )
      }
    }

    // Validate website URL if provided — only allow http/https to prevent javascript: XSS
    if (website && website.trim()) {
      try {
        const parsed = new URL(website)
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return NextResponse.json(
            { error: 'Website URL must use http or https' },
            { status: 400 }
          )
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid website URL' },
          { status: 400 }
        )
      }
    }

    // Update user profile
    const userRef = adminDb.collection('users').doc(userId)
    const updateData: any = {}

    if (displayName !== undefined) updateData.displayName = displayName
    if (username !== undefined) updateData.username = username.toLowerCase()
    if (bio !== undefined) updateData.bio = bio
    // Allow explicitly setting profileImageUrl to empty string (for removal)
    if (profileImageUrl !== undefined) {
      updateData.profileImageUrl = profileImageUrl || null
    }
    if (location !== undefined) updateData.location = location
    if (website !== undefined) updateData.website = website

    await userRef.update(updateData)

    return NextResponse.json({ success: true, message: 'Profile updated successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error updating profile' },
      { status: 500 }
    )
  }
}
