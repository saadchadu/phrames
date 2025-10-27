import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    database: 'unknown',
    config: {
      hasDatabase: !!config.databaseUrl,
      hasSession: !!config.sessionSecret,
      hasS3: !!(config.s3Bucket && config.s3AccessKeyId && config.s3SecretAccessKey)
    }
  }

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'connected'
  } catch (error: any) {
    checks.database = 'disconnected'
    checks.status = 'degraded'
    console.error('Health check - Database error:', error.message)
  }

  // Overall status
  if (!checks.config.hasDatabase || !checks.config.hasSession) {
    checks.status = 'unhealthy'
  }

  return checks
})