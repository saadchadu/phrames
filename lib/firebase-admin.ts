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