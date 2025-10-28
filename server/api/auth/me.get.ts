import { getCookie } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'
import { verifyFirebaseToken } from '~/server/utils/firebase'

export default defineEventHandler(async (event) => {
  // Try Firebase token first
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (token) {
    try {
      const firebaseUser = await verifyFirebaseToken(token)
      
      // Get user from database
      const user = await getUserFromEvent(event)
      if (user) {
        return {
          user: {
            id: user.id,
            email: user.email
          }
        }
      }
    } catch (error) {
      // Token invalid, fall through to session check
    }
  }

  // Fallback to session-based auth
  const user = await getUserFromEvent(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  return {
    user: {
      id: user.id,
      email: user.email
    }
  }
})
