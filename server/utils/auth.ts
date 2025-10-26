import type { H3Event } from 'h3'
import { getHeader } from 'h3'
import { verifyFirebaseToken } from './firebase-admin'
import { prisma } from './db'

interface FirebaseAuthUser {
  uid: string
  email?: string | null
  name?: string | null
  picture?: string | null
}

export async function getUserFromEvent(event: H3Event) {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  const decodedToken = await verifyFirebaseToken(token)
  
  if (!decodedToken) {
    return null
  }
  
  // Sync user with database
  const user = await syncUserWithDatabase(decodedToken)
  return user
}

export async function syncUserWithDatabase(firebaseUser: FirebaseAuthUser) {
  const { uid, email, name, picture } = firebaseUser
  const normalizedEmail = email || `${uid}@users.phrames`
  
  try {
    // Upsert user in PostgreSQL
    const user = await prisma.user.upsert({
      where: { id: uid },
      update: {
        email: normalizedEmail,
        displayName: name || null,
        photoURL: picture || null,
        updatedAt: new Date()
      },
      create: {
        id: uid,
        email: normalizedEmail,
        displayName: name || null,
        photoURL: picture || null
      }
    })
    
    return user
  } catch (error) {
    console.error('Error syncing user with database:', error)
    return null
  }
}
