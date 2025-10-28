import { sendRedirect } from 'h3'
import { firestoreHelpers } from '~/server/utils/firestore'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Campaign slug is required'
    })
  }

  try {
    const campaign = await firestoreHelpers.getCampaignBySlug(slug)

    if (!campaign) {
      const historicSlug = await firestoreHelpers.getSlugHistory(slug)

      if (historicSlug) {
        const currentCampaign = await firestoreHelpers.getCampaignById(historicSlug.campaignId)
        if (currentCampaign) {
          return sendRedirect(event, `/c/${currentCampaign.slug}`, 301)
        }
      }

      throw createError({
        statusCode: 404,
        statusMessage: 'Campaign not found'
      })
    }

    if (campaign.status !== 'active') {
      throw createError({
        statusCode: 410,
        statusMessage: 'Campaign unavailable'
      })
    }

    // Use the URL from the campaign object (already includes correct URL)
    return {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      aspectRatio: campaign.aspectRatio,
      visibility: campaign.visibility,
      status: campaign.status,
      frameAsset: {
        id: campaign.frameAsset.id,
        url: campaign.frameAsset.url,
        width: campaign.frameAsset.width,
        height: campaign.frameAsset.height
      },
      thumbnailAsset: campaign.thumbnailAsset ? {
        id: campaign.thumbnailAsset.id,
        url: campaign.thumbnailAsset.url,
        width: campaign.thumbnailAsset.width,
        height: campaign.thumbnailAsset.height
      } : null
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
