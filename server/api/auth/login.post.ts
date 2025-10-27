import { z } from 'zod'
import { setCookie } from 'h3'
import { prisma } from '~/server/utils/db'
import { verifyPassword, createSession } from '~/server/utils/auth'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = loginSchema.parse(body)

    // Development mode: use mock authentication when database is not available
    if (process.env.NODE_ENV === 'development') {
      try {
        // Try to connect to database first
        await prisma.$queryRaw`SELECT 1`
      } catch (dbError) {
        // Database not available, use mock authentication
        if (email === 'demo@phrames.com' && password === 'demo123') {
          const mockSessionId = 'dev-session-' + Date.now()
          
          setCookie(event, 'session-id', mockSessionId, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30 // 30 days
          })

          return {
            user: {
              id: 'dev-user-123',
              email: 'demo@phrames.com'
            }
          }
        } else {
          throw createError({
            statusCode: 401,
            statusMessage: 'Invalid email or password. Try demo@phrames.com / demo123'
          })
        }
      }
    }

    // Production mode or development with database: use real authentication
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password'
      })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password'
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
    
    // Check for database connection errors
    if (error.message?.includes("Can't reach database server")) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Database unavailable. Please try again later.'
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
