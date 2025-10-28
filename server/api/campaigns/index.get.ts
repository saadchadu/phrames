import { getUserFromEvent } from '~/server/utils/auth'
import { firestoreHelpers } from '~/server/utils/firestore'

export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event)
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const skip = (page - 1) * limit

    const { campaigns, total } = await firestoreHelpers.listCampaignsByUser(user.id, {
      offset: skip,
      limit
    })

    return {
      campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    console.error('Error in campaigns/index.get:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch campaigns'
    })
  }
})
