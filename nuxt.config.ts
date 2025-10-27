export default defineNuxtConfig({
  compatibilityDate: '2025-10-26',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  modules: [
    '@nuxt/ui',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  runtimeConfig: {
    // Private keys (only available on server-side)
    databaseUrl: process.env.DATABASE_URL,
    sessionSecret: process.env.SESSION_SECRET,
    s3Endpoint: process.env.S3_ENDPOINT,
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID,
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    s3Bucket: process.env.S3_BUCKET,
    s3PublicBaseUrl: process.env.S3_PUBLIC_BASE_URL,
    s3Region: process.env.S3_REGION || 'us-east-1',
    // Public keys (exposed to frontend)
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://phrames.cleffon.com'
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
