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
      statusMessage: 'Slug is required'
    })
  }
  
  try {
    const body = await readBody(event)
    const { event: eventType } = metricsSchema.parse(body)
    
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
    const updateData: any = {}
    switch (eventType) {
      case 'visit':
        updateData.visits = { increment: 1 }
        break
      case 'render':
        updateData.renders = { increment: 1 }
        break
      case 'download':
        updateData.downloads = { increment: 1 }
        break
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
        visits: eventType === 'visit' ? 1 : 0,
        renders: eventType === 'render' ? 1 : 0,
        downloads: eventType === 'download' ? 1 : 0
      }
    })
    
    return { success: true }
  } catch (error) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 400,
      statusMessage: error.message || 'Failed to record metric'
    })
  }
})