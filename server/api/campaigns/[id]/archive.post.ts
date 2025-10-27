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
    // Verify campaign ownership and update status
    const campaign = await prisma.campaign.updateMany({
      where: { 
        id: campaignId,
        userId: user.id
      },
      data: {
        status: 'archived',
        updatedAt: new Date()
      }
    })

    if (campaign.count === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaign not found'
      })
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'campaign.archived',
        targetType: 'campaign',
        targetId: campaignId,
        metadata: {}
      }
    })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error archiving campaign:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})