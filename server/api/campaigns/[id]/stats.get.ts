import { getUserFromEvent } from '~/server/utils/auth'
import { firestoreHelpers, getFirestore, Collections } from '~/server/utils/firestore'

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
    const db = getFirestore()
    const campaignDoc = await db.collection(Collections.CAMPAIGNS).doc(campaignId).get()

    if (!campaignDoc.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaign not found'
      })
    }

    const campaignData = campaignDoc.data()
    if (!campaignData || campaignData.userId !== user.id) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaign not found'
      })
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0]

    const stats = await firestoreHelpers.getCampaignStatsSince(campaignId, fromDate)

    return {
      campaign: {
        id: campaignId,
        name: campaignData.name,
        slug: campaignData.slug
      },
      totals: stats.totals,
      dailyStats: stats.dailyStats
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
