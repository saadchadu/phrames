import type { MultiPartData } from 'h3'
import { z, ZodError } from 'zod'
import { getUserFromEvent } from '~/server/utils/auth'
import { firestoreHelpers } from '~/server/utils/firestore'
import { validatePngWithAlpha, createThumbnail, generateAssetKey, toAspectRatio } from '~/server/utils/png'
import { uploadToFirebaseStorage } from '~/server/utils/storage'

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

    let frameFile: MultiPartData | null = null
    const campaignData: Record<string, string> = {}

    for (const field of formData) {
      if (field.name === 'frame' && field.data) {
        frameFile = field
      } else if (field.name && field.data) {
        campaignData[field.name] = field.data.toString()
      }
    }

    if (!frameFile || !frameFile.data) {
      throw new Error('Frame image is required')
    }

    const validatedData = createCampaignSchema.parse(campaignData)

    const slugExists = await firestoreHelpers.isSlugTaken(validatedData.slug)
    if (slugExists) {
      throw new Error('Slug already exists')
    }

    const buffer = Buffer.from(frameFile.data)
    const imageInfo = await validatePngWithAlpha(buffer)
    const aspectRatio = toAspectRatio(imageInfo.width, imageInfo.height)

    const frameKey = generateAssetKey(user.id, 'frame')
    const frameUrl = await uploadToFirebaseStorage(frameKey, buffer, 'image/png')

    const thumbnailBuffer = await createThumbnail(buffer)
    const thumbKey = generateAssetKey(user.id, 'thumb')
    const thumbUrl = await uploadToFirebaseStorage(thumbKey, thumbnailBuffer, 'image/png')

    const [frameAsset, thumbnailAsset] = await Promise.all([
      firestoreHelpers.createAsset({
        ownerUserId: user.id,
        type: 'frame_png',
        storageKey: frameKey,
        width: imageInfo.width,
        height: imageInfo.height,
        sizeBytes: imageInfo.sizeBytes
      }),
      firestoreHelpers.createAsset({
        ownerUserId: user.id,
        type: 'thumb_png',
        storageKey: thumbKey,
        width: 300,
        height: 300,
        sizeBytes: thumbnailBuffer.length
      })
    ])

    const campaign = await firestoreHelpers.createCampaign({
      userId: user.id,
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description,
      visibility: validatedData.visibility,
      frameAssetId: frameAsset.id,
      thumbnailAssetId: thumbnailAsset.id,
      aspectRatio
    })

    if (!campaign) {
      throw new Error('Failed to create campaign')
    }

    await firestoreHelpers.recordAuditLog({
      actorUserId: user.id,
      action: 'campaign.created',
      targetType: 'campaign',
      targetId: campaign.id,
      metadata: {
        slug: campaign.slug,
        visibility: campaign.visibility,
        aspectRatio: campaign.aspectRatio
      }
    })

    return {
      success: true,
      campaign
    }
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 422,
        statusMessage: error.issues[0]?.message || 'Validation failed'
      })
    }

    if (error instanceof Error && error.message === 'Slug already exists') {
      throw createError({
        statusCode: 409,
        statusMessage: error.message
      })
    }

    const message = error instanceof Error ? error.message : 'Failed to create campaign'

    throw createError({
      statusCode: 400,
      statusMessage: message
    })
  }
})
