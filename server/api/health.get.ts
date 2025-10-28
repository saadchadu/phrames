import { getFirestore, Collections } from '~/server/utils/firestore'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    firestore: 'unknown',
    config: {
      hasFirebaseAdmin: !!(config.firebaseProjectId && config.firebaseClientEmail && config.firebasePrivateKey),
      hasSession: !!config.sessionSecret,
      hasS3: !!(config.s3Bucket && config.s3AccessKeyId && config.s3SecretAccessKey)
    }
  }

  // Firestore check
  try {
    const db = getFirestore()
    await db.collection(Collections.USERS).limit(1).get()
    checks.firestore = 'connected'
  } catch (error: any) {
    checks.firestore = 'disconnected'
    checks.status = 'degraded'
    console.error('Health check - Firestore error:', error.message)
  }

  // Overall status
  if (!checks.config.hasFirebaseAdmin || !checks.config.hasSession) {
    checks.status = 'unhealthy'
  }

  return checks
})
