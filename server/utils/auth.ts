import { verifyFirebaseToken } from './firebase-admin'
import { prisma } from './db'

export async function getUserFromEvent(event: any) {
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

export async function syncUserWithDatabase(firebaseUser: any) {
  const { uid, email, name, picture } = firebaseUser
  
  try {
    // Upsert user in PostgreSQL
    const user = await prisma.user.upsert({
      where: { id: uid },
      update: {
        email: email || '',
        displayName: name || null,
        photoURL: picture || null,
        updatedAt: new Date()
      },
      create: {
        id: uid,
        email: email || '',
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