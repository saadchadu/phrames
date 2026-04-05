import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

// Initialize Firebase Admin SDK
if (!getApps().length) {
  // Handle private key — Vercel env vars may have literal \n instead of real newlines
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || ''
  const privateKey = rawKey.includes('\\n')
    ? rawKey.replace(/\\n/g, '\n')
    : rawKey

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }

  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })
}

export const auth = getAuth()
export const adminAuth = getAuth() // Alias for backward compatibility
export const adminDb = getFirestore()
export const adminStorage = getStorage()

// Helper function for token verification
export const verifyIdToken = async (idToken: string) => {
  return await auth.verifyIdToken(idToken)
}

/**
 * Checks if a user is blocked. Returns true if blocked (request should be rejected).
 * Use this in any API route that performs user actions.
 */
export async function isUserBlocked(userId: string): Promise<boolean> {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get()
    return userDoc.exists && userDoc.data()?.isBlocked === true
  } catch {
    return false
  }
}

/**
 * Verifies a Bearer token and returns the decoded token, or null if invalid/missing.
 */
export async function verifyBearerToken(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    return await auth.verifyIdToken(authHeader.split('Bearer ')[1])
  } catch {
    return null
  }
}