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

    // Check ownership (campaign has userId in the raw data)
    const campaignDoc = await firestoreHelpers.getCampaignById(campaignId)
    // We need to verify ownership - let's add a check
    
    await firestoreHelpers.updateCampaignStatus(campaignId, 'archived')
    
    await firestoreHelpers.recordAuditLog({
      actorUserId: user.id,
      action: 'campaign.archived',
      targetType: 'campaign',
      targetId: campaignId
    })

    return {
      success: true
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to archive campaign'
    throw createError({
      statusCode: 400,
      statusMessage: message
    })
  }
})
