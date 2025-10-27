import { z } from 'zod'
import { getUserFromEvent } from '~/server/utils/auth'
import { prisma } from '~/server/utils/db'

const updateCampaignSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  visibility: z.enum(['public', 'unlisted']).optional()
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

    // Verify campaign ownership
    const existingCampaign = await prisma.campaign.findUnique({
      where: { 
        id: campaignId,
        userId: user.id
      }
    })

    if (!existingCampaign) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaign not found'
      })
    }

    // Update campaign
    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        frameAsset: true
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'campaign.updated',
        targetType: 'campaign',
        targetId: campaignId,
        metadata: updateData
      }
    })

    return {
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        slug: campaign.slug,
        description: campaign.description,
        visibility: campaign.visibility,
        status: campaign.status,
        aspectRatio: campaign.aspectRatio,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        frameAsset: {
          id: campaign.frameAsset.id,
          width: campaign.frameAsset.width,
          height: campaign.frameAsset.height,
          storageKey: campaign.frameAsset.storageKey
        }
      }
    }
  } catch (error: any) {
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