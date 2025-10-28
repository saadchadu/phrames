import type { H3Event } from 'h3'
import { getCookie, getHeader } from 'h3'
import { firestoreHelpers } from './firestore'

export async function getUserFromEvent(event: H3Event) {
  // Try Firebase token first
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (token) {
    try {
      const { verifyFirebaseToken } = await import('./firebase')
      const firebaseUser = await verifyFirebaseToken(token)

      // Get user from Firestore by Firebase UID
      const user = await firestoreHelpers.getUserByFirebaseUid(firebaseUser.uid)

      if (user && (user as any).status === 'active') {
        return user
      }
    } catch (error) {
      console.error('Firebase token verification failed:', error)
    }
  }

  // Fallback to session-based auth
  const sessionId = getCookie(event, 'session-id')
  if (!sessionId) {
    return null
  }

  try {
    const session = await firestoreHelpers.getSession(sessionId)

    if (!session) {
      return null
    }

    // Get user from session
    const user = await firestoreHelpers.getUserById((session as any).userId)

    if (!user || (user as any).status !== 'active') {
      return null
    }

    return user
  } catch (error) {
    console.error('Error getting user from session:', error)
    return null
  }
}

export async function createSession(userId: string): Promise<string> {
  return await firestoreHelpers.createSession(userId)
}

export async function deleteSession(sessionId: string): Promise<void> {
  await firestoreHelpers.deleteSession(sessionId)
}
