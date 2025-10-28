import { z } from 'zod'
import { firestoreHelpers } from '~/server/utils/firestore'

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

    const campaign = await firestoreHelpers.getCampaignBySlug(slug)

    if (!campaign || campaign.status !== 'active') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaign not found'
      })
    }

    const today = new Date()
    const dateKey = today.toISOString().split('T')[0]

    await firestoreHelpers.incrementCampaignMetric(campaign.id, dateKey, metricEvent)

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
