export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    // Check if all required Firebase Admin variables are present
    const checks = {
      firebaseProjectId: !!config.firebaseProjectId,
      firebaseClientEmail: !!config.firebaseClientEmail,
      firebasePrivateKey: !!config.firebasePrivateKey,
      firebaseProjectIdValue: config.firebaseProjectId || 'MISSING',
      firebaseClientEmailValue: config.firebaseClientEmail || 'MISSING'
    }
    
    // Try to initialize Firebase Admin
    let firebaseInitResult = 'NOT_ATTEMPTED'
    try {
      const { getFirebaseAdmin } = await import('~/server/utils/firebase')
      const firebase = getFirebaseAdmin()
      firebaseInitResult = firebase ? 'SUCCESS' : 'FAILED'
    } catch (error: any) {
      firebaseInitResult = `ERROR: ${error.message}`
    }
    
    // Try to initialize Firestore
    let firestoreInitResult = 'NOT_ATTEMPTED'
    try {
      const { getFirestore } = await import('~/server/utils/firestore')
      const db = getFirestore()
      firestoreInitResult = db ? 'SUCCESS' : 'FAILED'
    } catch (error: any) {
      firestoreInitResult = `ERROR: ${error.message}`
    }
    
    return {
      environmentChecks: checks,
      firebaseAdmin: firebaseInitResult,
      firestore: firestoreInitResult,
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    return {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }
  }
})