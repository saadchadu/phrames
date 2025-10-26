import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

let adminApp: any = null

function getFirebaseAdmin() {
  if (adminApp) return adminApp
  
  const config = useRuntimeConfig()
  
  if (!config.firebaseAdminProjectId || !config.firebaseAdminClientEmail || !config.firebaseAdminPrivateKey) {
    throw new Error('Firebase Admin configuration is missing')
  }
  
  if (getApps().length === 0) {
    try {
      adminApp = initializeApp({
        credential: cert({
          projectId: config.firebaseAdminProjectId,
          clientEmail: config.firebaseAdminClientEmail,
          privateKey: config.firebaseAdminPrivateKey.replace(/\\n/g, '\n')
        })
      })
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error)
      throw new Error('Firebase Admin initialization failed')
    }
  } else {
    adminApp = getApps()[0]
  }
  
  return adminApp
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseAdmin())
}

export function getFirebaseFirestore() {
  return getFirestore(getFirebaseAdmin())
}

export async function verifyFirebaseToken(token: string) {
  try {
    const auth = getFirebaseAuth()
    const decodedToken = await auth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error('Firebase token verification failed:', error)
    return null
  }
}