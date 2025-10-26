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
  
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const skip = (page - 1) * limit
  
  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where: { userId: user.id },
      include: {
        frameAsset: true,
        _count: {
          select: {
            stats: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.campaign.count({
      where: { userId: user.id }
    })
  ])
  
  return {
    campaigns: campaigns.map(campaign => ({
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
      },
      statsCount: campaign._count.stats
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
})