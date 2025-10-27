import { validateEnvironment } from '~/server/utils/config'

export default defineNitroPlugin(() => {
  validateEnvironment({ strict: process.env.NODE_ENV === 'production' })
})
