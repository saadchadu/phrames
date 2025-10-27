import { validateEnvironment } from '~/server/utils/config'

export default defineNitroPlugin(() => {
  try {
    validateEnvironment({ strict: process.env.NODE_ENV === 'production' })
  } catch (error) {
    console.error('[phrames] Runtime environment validation failed:', error)
    // Don't re-throw to prevent app crashes in production
  }
})
