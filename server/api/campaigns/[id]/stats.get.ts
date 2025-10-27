import { getUserFromEvent } from '~/server/utils/auth'
import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const campaignId = getRouterParam(event, 'id')
  
  if (!campaignId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Campaign ID is required'
    })
  }

  try {
    // Verify campaign ownership
    const campaign = await prisma.campaign.findUnique({
      where: { 
        id: campaignId,
        userId: user.id
      }
    })

    if (!campaign) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaign not found'
      })
    }

    // Get daily stats for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyStats = await prisma.campaignStatsDaily.findMany({
      where: {
        campaignId,
        date: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Calculate totals
    const totals = dailyStats.reduce(
      (acc, stat) => ({
        visits: acc.visits + stat.visits,
        renders: acc.renders + stat.renders,
        downloads: acc.downloads + stat.downloads
      }),
      { visits: 0, renders: 0, downloads: 0 }
    )

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        slug: campaign.slug
      },
      totals,
      dailyStats: dailyStats.map(stat => ({
        date: stat.date.toISOString().split('T')[0],
        visits: stat.visits,
        renders: stat.renders,
        downloads: stat.downloads
      }))
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error fetching campaign stats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})