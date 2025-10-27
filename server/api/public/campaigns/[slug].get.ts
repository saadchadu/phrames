import { prisma } from '~/server/utils/db'
import { getPublicUrl } from '~/server/utils/s3'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Campaign slug is required'
    })
  }

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { 
        slug,
        status: 'active'
      },
      include: {
        frameAsset: true
      }
    })

    if (!campaign) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaign not found'
      })
    }

    // Check visibility
    if (campaign.visibility === 'unlisted') {
      // Allow access but don't list publicly
    }

    const frameUrl = getPublicUrl(campaign.frameAsset.storageKey)

    return {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      frameUrl,
      frameWidth: campaign.frameAsset.width,
      frameHeight: campaign.frameAsset.height,
      aspectRatio: campaign.aspectRatio,
      visibility: campaign.visibility,
      status: campaign.status
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error fetching campaign:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})