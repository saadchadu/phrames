import * as admin from 'firebase-admin'

// Lazy initialization function
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    let privateKey = process.env.FIREBASE_PRIVATE_KEY

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin credentials in environment variables')
    }

    // Handle different private key formats
    // Remove quotes if present
    privateKey = privateKey.replace(/^["']|["']$/g, '')
    // Replace literal \n with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n')
    // Trim any extra whitespace
    privateKey = privateKey.trim()

    console.log('[firebase-admin] Initializing with project:', projectId)
    
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    })
    
    console.log('[firebase-admin] Initialized successfully')
    return app
  } catch (error) {
    console.error('[firebase-admin] Initialization error:', error)
    throw error
  }
}

// Lazy getters
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(target, prop) {
    initializeFirebaseAdmin()
    return (admin.firestore() as any)[prop]
  }
})

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(target, prop) {
    initializeFirebaseAdmin()
    return (admin.auth() as any)[prop]
  }
})

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
