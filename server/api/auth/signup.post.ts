import { z } from 'zod'
import { setCookie } from 'h3'
import { prisma } from '~/server/utils/db'
import { hashPassword, createSession } from '~/server/utils/auth'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = signupSchema.parse(body)

    // Check database availability first
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      // Database not available
      if (process.env.NODE_ENV === 'development') {
        // Development mode: use mock authentication
        const mockSessionId = 'dev-session-' + Date.now()
        
        setCookie(event, 'session-id', mockSessionId, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        })

        return {
          user: {
            id: 'dev-user-' + Date.now(),
            email: email
          }
        }
      } else {
        // Production mode: return service unavailable
        throw createError({
          statusCode: 503,
          statusMessage: 'Service temporarily unavailable. Please try again later.'
        })
      }
    }

    // Production mode or development with database: use real authentication
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is already registered'
      })
    }

    // Create user
    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash
      }
    })

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
    
    console.error('Signup error:', error)
    
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
