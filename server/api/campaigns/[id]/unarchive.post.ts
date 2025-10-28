import { getUserFromEvent } from '~/server/utils/auth'
import { firestoreHelpers } from '~/server/utils/firestore'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const campaignId = event.context.params?.id
  
  if (!campaignId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Campaign ID is required'
    })
  }

  try {
    const campaign = await firestoreHelpers.getCampaignById(campaignId)
    
    if (!campaign) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaign not found'
      })
    }

    await firestoreHelpers.updateCampaignStatus(campaignId, 'active')
    
    await firestoreHelpers.recordAuditLog({
      actorUserId: user.id,
      action: 'campaign.unarchived',
      targetType: 'campaign',
      targetId: campaignId
    })

    return {
      success: true
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to unarchive campaign'
    throw createError({
      statusCode: 400,
      statusMessage: message
    })
  }
})
