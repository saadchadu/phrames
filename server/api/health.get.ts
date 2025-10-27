import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    // Simple database connectivity check
    await prisma.$queryRaw`SELECT 1`
    
    return {
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('Health check failed:', error)
    
    return {
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message?.includes("Can't reach database server") 
        ? 'Database server unreachable'
        : 'Database error',
      timestamp: new Date().toISOString()
    }
  }
})