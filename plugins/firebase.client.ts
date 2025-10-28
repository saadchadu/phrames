import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId
  }

  // Initialize Firebase only if config is available
  if (firebaseConfig.apiKey) {
    try {
      const app = initializeApp(firebaseConfig)
      const auth = getAuth(app)

      return {
        provide: {
          firebase: app,
          firebaseAuth: auth
        }
      }
    } catch (error) {
      console.warn('Firebase initialization failed:', error)
      return {
        provide: {
          firebase: null,
          firebaseAuth: null
        }
      }
    }
  }

  // Return null providers if Firebase is not configured
  return {
    provide: {
      firebase: null,
      firebaseAuth: null
    }
  }
})
