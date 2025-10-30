import { setCookie } from 'h3'
import { verifyFirebaseToken } from '~/server/utils/firebase'
import { firestoreHelpers } from '~/server/utils/firestore'
import { createSession } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    console.log('[LOGIN] Starting login process')
    
    // Get Firebase token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      console.log('[LOGIN] No token provided')
      throw createError({
        statusCode: 401,
        statusMessage: 'No authentication token provided'
      })
    }

    console.log('[LOGIN] Token received, verifying...')

    // Verify Firebase token
    let firebaseUser
    try {
      firebaseUser = await verifyFirebaseToken(token)
      console.log('[LOGIN] Token verified for user:', firebaseUser.uid)
    } catch (error) {
      console.error('[LOGIN] Token verification failed:', error)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid authentication token'
      })
    }

    console.log('[LOGIN] Looking up user in Firestore...')

    // Find or create user in Firestore
    let user = await firestoreHelpers.getUserByFirebaseUid(firebaseUser.uid)

    if (!user) {
      console.log('[LOGIN] User not found, creating new user...')
      // Create user if doesn't exist (auto-registration)
      user = await firestoreHelpers.createUser({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email!,
        emailVerified: firebaseUser.email_verified || false
      })
      console.log('[LOGIN] New user created:', user.id)
    } else {
      console.log('[LOGIN] Existing user found:', user.id)
    }

    console.log('[LOGIN] Creating session...')

    // Create session
    const sessionId = await createSession(user.id)
    console.log('[LOGIN] Session created:', sessionId)

    // Set session cookie
    setCookie(event, 'session-id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    console.log('[LOGIN] Login successful for user:', user.id)

    return {
      user: {
        id: user.id,
        email: (user as any).email
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      console.error('[LOGIN] Known error:', error.statusCode, error.statusMessage)
      throw error
    }
    
    console.error('[LOGIN] Unexpected error:', error)
    console.error('[LOGIN] Error stack:', error.stack)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
