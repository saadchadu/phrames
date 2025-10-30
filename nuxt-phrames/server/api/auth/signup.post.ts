import { z } from 'zod'
import { prisma } from '~/server/utils/db'
import { hashPassword, createSession } from '~/server/utils/auth'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User already exists'
      })
    }

    // Create user
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    })

    // Create session
    const sessionToken = await createSession(user.id)

    // Set session cookie
    setCookie(event, 'session-token', sessionToken, {
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
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Signup error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})