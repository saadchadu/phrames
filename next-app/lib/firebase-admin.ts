import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let adminApp: App | null = null
let adminAuth: Auth | null = null
let adminFirestore: Firestore | null = null

export function getFirebaseAdmin() {
  if (adminApp && adminAuth && adminFirestore) {
    return { app: adminApp, auth: adminAuth, firestore: adminFirestore }
  }

  // Check if Firebase is configured
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.warn('Firebase Admin not configured - missing environment variables')
    return null
  }

  try {
    // Check if app already exists
    const existingApps = getApps()
    if (existingApps.length > 0) {
      adminApp = existingApps[0]
    } else {
      // Initialize Firebase Admin
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
      })
    }

    adminAuth = getAuth(adminApp)
    adminFirestore = getFirestore(adminApp)
    
    return { app: adminApp, auth: adminAuth, firestore: adminFirestore }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error)
    return null
  }
}

export async function verifyFirebaseToken(token: string) {
  const firebase = getFirebaseAdmin()
  if (!firebase) {
    throw new Error('Firebase Admin not configured')
  }

  try {
    const decodedToken = await firebase.auth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error('Token verification failed:', error)
    throw new Error('Invalid token')
  }
}