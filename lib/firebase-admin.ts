import * as admin from 'firebase-admin'

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin credentials in environment variables')
    }

    console.log('[firebase-admin] Initializing with project:', projectId)
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    })
    
    console.log('[firebase-admin] Initialized successfully')
  } catch (error) {
    console.error('[firebase-admin] Initialization error:', error)
    throw error
  }
} else {
  console.log('[firebase-admin] Already initialized')
}

export const adminDb = admin.firestore()
export const adminAuth = admin.auth()

// Verify ID token
export async function verifyIdToken(token: string) {
  try {
    return await adminAuth.verifyIdToken(token)
  } catch (error) {
    console.error('Error verifying ID token:', error)
    throw new Error('Invalid authentication token')
  }
}

export default admin
