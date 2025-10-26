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
  
  const campaign = await prisma.campaign.findFirst({
    where: { 
      id: campaignId,
      userId: user.id
    },
    include: {
      frameAsset: true,
      _count: {
        select: {
          stats: true
        }
      }
    }
  })
  
  if (!campaign) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Campaign not found'
    })
  }
  
  return {
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
      storageKey: campaign.frameAsset.storageKey,
      sizeBytes: campaign.frameAsset.sizeBytes
    },
    statsCount: campaign._count.stats
  }
})