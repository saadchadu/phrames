export default defineEventHandler(async (event) => {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {} as Record<string, any>
  }

  // Test 1: Environment Variables
  try {
    const config = useRuntimeConfig()
    results.tests.environment = {
      status: 'checking',
      firebaseProjectId: !!config.firebaseProjectId,
      firebaseClientEmail: !!config.firebaseClientEmail,
      firebasePrivateKey: !!config.firebasePrivateKey,
      publicFirebaseApiKey: !!config.public.firebaseApiKey,
      publicFirebaseProjectId: !!config.public.firebaseProjectId,
      publicFirebaseStorageBucket: !!config.public.firebaseStorageBucket
    }
    
    const missing = []
    if (!config.firebaseProjectId) missing.push('FIREBASE_PROJECT_ID')
    if (!config.firebaseClientEmail) missing.push('FIREBASE_CLIENT_EMAIL')
    if (!config.firebasePrivateKey) missing.push('FIREBASE_PRIVATE_KEY')
    if (!config.public.firebaseApiKey) missing.push('NUXT_PUBLIC_FIREBASE_API_KEY')
    if (!config.public.firebaseProjectId) missing.push('NUXT_PUBLIC_FIREBASE_PROJECT_ID')
    
    results.tests.environment.status = missing.length === 0 ? 'pass' : 'fail'
    results.tests.environment.missing = missing
  } catch (error: any) {
    results.tests.environment = { status: 'error', error: error.message }
  }

  // Test 2: Firebase Admin
  try {
    const { getFirebaseAdmin } = await import('~/server/utils/firebase')
    const firebase = getFirebaseAdmin()
    results.tests.firebaseAdmin = {
      status: firebase ? 'pass' : 'fail',
      initialized: !!firebase
    }
  } catch (error: any) {
    results.tests.firebaseAdmin = { status: 'error', error: error.message }
  }

  // Test 3: Firestore
  try {
    const { getFirestore } = await import('~/server/utils/firestore')
    const db = getFirestore()
    
    // Try a simple query
    const testCollection = await db.collection('users').limit(1).get()
    
    results.tests.firestore = {
      status: 'pass',
      initialized: true,
      canQuery: true,
      testQuerySize: testCollection.size
    }
  } catch (error: any) {
    results.tests.firestore = { 
      status: 'error', 
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3)
    }
  }

  // Test 4: Storage
  try {
    const { existsSync } = await import('fs')
    const { join } = await import('path')
    
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    const framesDir = join(uploadsDir, 'frames')
    const thumbsDir = join(uploadsDir, 'thumbs')
    
    results.tests.storage = {
      status: 'checking',
      uploadsExists: existsSync(uploadsDir),
      framesExists: existsSync(framesDir),
      thumbsExists: existsSync(thumbsDir)
    }
    
    results.tests.storage.status = 
      results.tests.storage.uploadsExists && 
      results.tests.storage.framesExists && 
      results.tests.storage.thumbsExists ? 'pass' : 'fail'
  } catch (error: any) {
    results.tests.storage = { status: 'error', error: error.message }
  }

  // Test 5: Auth Token Verification
  try {
    const authHeader = getHeader(event, 'authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (token) {
      const { verifyFirebaseToken } = await import('~/server/utils/firebase')
      const firebaseUser = await verifyFirebaseToken(token)
      
      results.tests.auth = {
        status: 'pass',
        tokenProvided: true,
        tokenValid: true,
        userEmail: firebaseUser.email,
        userId: firebaseUser.uid
      }
    } else {
      results.tests.auth = {
        status: 'skip',
        tokenProvided: false,
        message: 'No token provided (this is OK for this test)'
      }
    }
  } catch (error: any) {
    results.tests.auth = { 
      status: 'error', 
      tokenProvided: true,
      tokenValid: false,
      error: error.message 
    }
  }

  // Test 6: Campaign Query (if authenticated)
  if (results.tests.auth?.status === 'pass') {
    try {
      const { getUserFromEvent } = await import('~/server/utils/auth')
      const user = await getUserFromEvent(event)
      
      if (user) {
        const { firestoreHelpers } = await import('~/server/utils/firestore')
        const { campaigns, total } = await firestoreHelpers.listCampaignsByUser(user.id, {
          offset: 0,
          limit: 10
        })
        
        results.tests.campaigns = {
          status: 'pass',
          userFound: true,
          userId: user.id,
          campaignCount: campaigns.length,
          totalCampaigns: total
        }
      } else {
        results.tests.campaigns = {
          status: 'fail',
          userFound: false,
          message: 'User not found in database'
        }
      }
    } catch (error: any) {
      results.tests.campaigns = { 
        status: 'error', 
        error: error.message,
        stack: error.stack?.split('\n').slice(0, 5)
      }
    }
  } else {
    results.tests.campaigns = {
      status: 'skip',
      message: 'Skipped (no auth token provided)'
    }
  }

  // Summary
  const allTests = Object.values(results.tests)
  const passed = allTests.filter((t: any) => t.status === 'pass').length
  const failed = allTests.filter((t: any) => t.status === 'fail').length
  const errors = allTests.filter((t: any) => t.status === 'error').length
  const skipped = allTests.filter((t: any) => t.status === 'skip').length

  results.summary = {
    total: allTests.length,
    passed,
    failed,
    errors,
    skipped,
    allPassed: failed === 0 && errors === 0
  }

  return results
})
