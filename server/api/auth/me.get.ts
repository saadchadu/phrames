import { getCookie } from 'h3'
import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // Development mode: check for mock session
  if (process.env.NODE_ENV === 'development') {
    const sessionId = getCookie(event, 'session-id')
    if (sessionId?.startsWith('dev-session-')) {
      return {
        user: {
          id: 'dev-user-123',
          email: 'demo@phrames.com'
        }
      }
    }
  }

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
