import { getCookie, deleteCookie } from 'h3'
import { deleteSession } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const sessionId = getCookie(event, 'session-id')
    
    if (sessionId) {
      await deleteSession(sessionId)
    }

    // Clear session cookie
    deleteCookie(event, 'session-id')

    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})