import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'

let adminApp: App | null = null
let adminAuth: Auth | null = null

export function getFirebaseAdmin() {
  if (adminApp && adminAuth) {
    return { app: adminApp, auth: adminAuth }
  }

  const config = useRuntimeConfig()

  // Check if Firebase is configured
  if (!config.firebaseProjectId || !config.firebaseClientEmail || !config.firebasePrivateKey) {
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
          projectId: config.firebaseProjectId,
          clientEmail: config.firebaseClientEmail,
          privateKey: config.firebasePrivateKey.replace(/\\n/g, '\n')
        }),
        projectId: config.firebaseProjectId
      })
    }

    adminAuth = getAuth(adminApp)
    return { app: adminApp, auth: adminAuth }
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
