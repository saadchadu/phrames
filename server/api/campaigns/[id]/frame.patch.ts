import { getUserFromEvent } from '~/server/utils/auth'
import { firestoreHelpers, getFirestore, Collections } from '~/server/utils/firestore'
import { validatePngWithAlpha, createThumbnail, generateAssetKey, toAspectRatio } from '~/server/utils/png'
import { uploadToFirebaseStorage } from '~/server/utils/storage'

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

    const formData = await readMultipartFormData(event)

    if (!formData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Frame image is required'
      })
    }

    const frameField = formData.find((field) => field.name === 'frame' && field.data)

    if (!frameField) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Frame image is required'
      })
    }

    // Validate PNG
    const buffer = Buffer.from(frameField.data)
    const imageInfo = await validatePngWithAlpha(buffer)
    const aspectRatio = toAspectRatio(imageInfo.width, imageInfo.height)

    // Upload new frame
    const frameKey = generateAssetKey(user.id, 'frame')
    const frameUrl = await uploadToFirebaseStorage(frameKey, buffer, 'image/png')

    // Create new thumbnail
    const thumbnailBuffer = await createThumbnail(buffer)
    const thumbKey = generateAssetKey(user.id, 'thumb')
    const thumbUrl = await uploadToFirebaseStorage(thumbKey, thumbnailBuffer, 'image/png')

    // Create assets
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

    const updatedCampaign = await firestoreHelpers.updateCampaign(campaignId, {
      frameAssetId: frameAsset.id,
      thumbnailAssetId: thumbnailAsset.id,
      aspectRatio
    })

    if (!updatedCampaign) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaign not found'
      })
    }

    await firestoreHelpers.recordAuditLog({
      actorUserId: user.id,
      action: 'campaign.frame.updated',
      targetType: 'campaign',
      targetId: campaignId,
      metadata: {
        width: imageInfo.width,
        height: imageInfo.height,
        sizeBytes: imageInfo.sizeBytes
      }
    })

    return {
      success: true,
      campaign: updatedCampaign
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Error updating frame:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
