import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

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
  })
}

export const auth = getAuth()
export const adminAuth = getAuth() // Alias for backward compatibility
export const adminDb = getFirestore()

// Helper function for token verification
export const verifyIdToken = async (idToken: string) => {
  return await auth.verifyIdToken(idToken)
}