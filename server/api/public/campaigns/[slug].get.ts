import { prisma } from '~/server/utils/db'
import { getPublicUrl } from '~/server/utils/s3'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }
  
  const campaign = await prisma.campaign.findUnique({
    where: { 
      slug,
      status: 'active'
    },
    include: {
      frameAsset: true,
      user: {
        select: {
          email: true
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
  
  if (campaign.visibility === 'unlisted') {
    // Still allow access but don't index
  }
  
  return {
    id: campaign.id,
    name: campaign.name,
    slug: campaign.slug,
    description: campaign.description,
    visibility: campaign.visibility,
    aspectRatio: campaign.aspectRatio,
    createdAt: campaign.createdAt,
    frameAsset: {
      id: campaign.frameAsset.id,
      url: getPublicUrl(campaign.frameAsset.storageKey),
      width: campaign.frameAsset.width,
      height: campaign.frameAsset.height
    },
    creator: {
      email: campaign.user.email
    }
  }
})