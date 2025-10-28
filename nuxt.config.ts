export default defineNuxtConfig({
  compatibilityDate: '2025-10-26',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt'
  ],
  runtimeConfig: {
    // Private keys (only available on server-side)
    sessionSecret: process.env.SESSION_SECRET,

    // Firebase Admin
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
    // Public keys (exposed to frontend)
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://phrames.cleffon.com',
      // Firebase Client
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID
    }
  },
  routeRules: {
    '/c/**': { 
      headers: { 'Cache-Control': 's-maxage=300' },
      ssr: true 
    }
  },
  nitro: {
    experimental: {
      wasm: true
    }
  }
})
