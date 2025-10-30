export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Private keys (server-side only)
    sessionSecret: process.env.SESSION_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    s3Endpoint: process.env.S3_ENDPOINT,
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID,
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    s3Bucket: process.env.S3_BUCKET,
    s3PublicBaseUrl: process.env.S3_PUBLIC_BASE_URL,
    
    // Public keys (exposed to client-side)
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://phrames.cleffon.com'
    }
  },
  nitro: {
    experimental: {
      wasm: true
    }
  },
  ssr: true
})