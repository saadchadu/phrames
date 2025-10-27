import { z } from 'zod'
import { prisma } from '~/server/utils/db'

const metricsSchema = z.object({
  event: z.enum(['visit', 'render', 'download'])
})

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Campaign slug is required'
    })
  }

  try {
    const body = await readBody(event)
    const { event: metricEvent } = metricsSchema.parse(body)

    // Find campaign
    const campaign = await prisma.campaign.findUnique({
      where: { 
        slug,
        status: 'active'
      }
    })

    if (!campaign) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaign not found'
      })
    }

    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Update or create daily stats
    const updateData = {
      visits: metricEvent === 'visit' ? { increment: 1 } : undefined,
      renders: metricEvent === 'render' ? { increment: 1 } : undefined,
      downloads: metricEvent === 'download' ? { increment: 1 } : undefined
    }

    await prisma.campaignStatsDaily.upsert({
      where: {
        campaignId_date: {
          campaignId: campaign.id,
          date: today
        }
      },
      update: updateData,
      create: {
        campaignId: campaign.id,
        date: today,
        visits: metricEvent === 'visit' ? 1 : 0,
        renders: metricEvent === 'render' ? 1 : 0,
        downloads: metricEvent === 'download' ? 1 : 0
      }
    })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error recording metrics:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})