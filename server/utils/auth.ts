import type { H3Event } from 'h3'
import { getCookie } from 'h3'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

export async function getUserFromEvent(event: H3Event) {
  const sessionId = getCookie(event, 'session-id')
  if (!sessionId) {
    return null
  }
  
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true }
    })
    
    if (!session || session.expiresAt < new Date()) {
      return null
    }
    
    return session.user
  } catch (error) {
    console.error('Error getting user from session:', error)
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days
  
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt
    }
  })
  
  return session.id
}

export async function deleteSession(sessionId: string): Promise<void> {
  await prisma.session.delete({
    where: { id: sessionId }
  }).catch(() => {
    // Session might not exist, ignore error
  })
}
