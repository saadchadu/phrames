import { z, ZodError } from 'zod'
import { getUserFromEvent } from '~/server/utils/auth'
import { prisma } from '~/server/utils/db'
import { validatePngWithAlpha, createThumbnail, generateAssetKey } from '~/server/utils/png'
import { uploadToS3 } from '~/server/utils/s3'

const createCampaignSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  visibility: z.enum(['public', 'unlisted']).default('public')
})

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  
  try {
    const formData = await readMultipartFormData(event)
    
    if (!formData) {
      throw new Error('No form data received')
    }
    
    let frameFile: any = null
    let campaignData: any = {}
    
    // Parse form data
    for (const field of formData) {
      if (field.name === 'frame' && field.data) {
        frameFile = field
      } else if (field.name && field.data) {
        campaignData[field.name] = field.data.toString()
      }
    }
    
    if (!frameFile) {
      throw new Error('Frame image is required')
    }
    
    // Validate campaign data
    const validatedData = createCampaignSchema.parse(campaignData)
    
    // Check if slug is unique
    const existingCampaign = await prisma.campaign.findUnique({
      where: { slug: validatedData.slug }
    })
    
    if (existingCampaign) {
      throw new Error('Slug already exists')
    }
    
    // Validate PNG
    const imageInfo = await validatePngWithAlpha(frameFile.data)
    
    // Calculate aspect ratio
    const aspectRatio = `${imageInfo.width}:${imageInfo.height}`
    
    // Upload frame to S3
    const frameKey = generateAssetKey(user.id, 'frame')
    await uploadToS3(frameKey, frameFile.data, 'image/png')
    
    // Create thumbnail
    const thumbnailBuffer = await createThumbnail(frameFile.data)
    const thumbKey = generateAssetKey(user.id, 'thumb')
    await uploadToS3(thumbKey, thumbnailBuffer, 'image/png')
    
    // Create assets in database
    const [frameAsset, thumbAsset] = await Promise.all([
      prisma.asset.create({
        data: {
          ownerUserId: user.id,
          type: 'frame_png',
          storageKey: frameKey,
          width: imageInfo.width,
          height: imageInfo.height,
          sizeBytes: imageInfo.sizeBytes
        }
      }),
      prisma.asset.create({
        data: {
          ownerUserId: user.id,
          type: 'thumb_png',
          storageKey: thumbKey,
          width: 300,
          height: 300,
          sizeBytes: thumbnailBuffer.length
        }
      })
    ])
    
    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        visibility: validatedData.visibility,
        frameAssetId: frameAsset.id,
        aspectRatio
      },
      include: {
        frameAsset: true
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
        frameAsset: {
          id: campaign.frameAsset.id,
          width: campaign.frameAsset.width,
          height: campaign.frameAsset.height,
          storageKey: campaign.frameAsset.storageKey
        }
      }
    }
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 422,
        statusMessage: error.issues[0]?.message || 'Validation failed'
      })
    }

    const message = error instanceof Error ? error.message : 'Failed to create campaign'

    throw createError({
      statusCode: 400,
      statusMessage: message
    })
  }
})
