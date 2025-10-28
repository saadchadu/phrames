import { z } from 'zod'
import { getUserFromEvent } from '~/server/utils/auth'
import { firestoreHelpers, getFirestore, Collections } from '~/server/utils/firestore'

const updateCampaignSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).nullable().optional(),
  visibility: z.enum(['public', 'unlisted']).optional(),
  status: z.enum(['active', 'archived']).optional()
})

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
    const body = await readBody(event)
    const updateData = updateCampaignSchema.parse(body)

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

    if (campaignData.status === 'suspended') {
      throw createError({
        statusCode: 423,
        statusMessage: 'Campaign is suspended and cannot be updated'
      })
    }

    if (updateData.slug) {
      const slugTaken = await firestoreHelpers.isSlugTaken(updateData.slug, campaignId)
      if (slugTaken) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Slug already exists'
        })
      }
    }

    const campaign = await firestoreHelpers.updateCampaign(campaignId, updateData)

    if (!campaign) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaign not found'
      })
    }

    await firestoreHelpers.recordAuditLog({
      actorUserId: user.id,
      action: 'campaign.updated',
      targetType: 'campaign',
      targetId: campaignId,
      metadata: updateData
    })

    return {
      success: true,
      campaign
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 422,
        statusMessage: error.issues[0]?.message || 'Validation failed'
      })
    }

    if (error.statusCode) {
      throw error
    }

    console.error('Error updating campaign:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
