import { getUserFromEvent } from '~/server/utils/auth'
import { firestoreHelpers, getFirestore, Collections } from '~/server/utils/firestore'

export default defineEventHandler(async (event) => {
  try {
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

    // Get campaign to verify ownership
    const db = getFirestore()
    const campaignDoc = await db.collection(Collections.CAMPAIGNS).doc(campaignId).get()
    
    if (!campaignDoc.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaign not found'
      })
    }

    const campaignData = campaignDoc.data()
    
    // Verify ownership
    if (campaignData?.userId !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to delete this campaign'
      })
    }

    // Delete the campaign
    await campaignDoc.ref.delete()

    // Record audit log
    await firestoreHelpers.recordAuditLog({
      actorUserId: user.id,
      action: 'campaign.deleted',
      targetType: 'campaign',
      targetId: campaignId,
      metadata: {
        name: campaignData.name,
        slug: campaignData.slug
      }
    })

    return {
      success: true,
      message: 'Campaign deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting campaign:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete campaign'
    })
  }
})
