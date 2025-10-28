import { setCookie } from 'h3'
import { verifyFirebaseToken } from '~/server/utils/firebase'
import { firestoreHelpers } from '~/server/utils/firestore'
import { createSession } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Get Firebase token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No authentication token provided'
      })
    }

    // Verify Firebase token
    let firebaseUser
    try {
      firebaseUser = await verifyFirebaseToken(token)
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid authentication token'
      })
    }

    // Find or create user in Firestore
    let user = await firestoreHelpers.getUserByFirebaseUid(firebaseUser.uid)

    if (!user) {
      // Create user if doesn't exist (auto-registration)
      user = await firestoreHelpers.createUser({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email!,
        emailVerified: firebaseUser.email_verified || false
      })
    }

    // Create session
    const sessionId = await createSession(user.id)

    // Set session cookie
    setCookie(event, 'session-id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    return {
      user: {
        id: user.id,
        email: user.email
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Login error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
