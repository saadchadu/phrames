import { z, ZodError } from 'zod'
import { firestoreHelpers, getFirestore, Collections } from '~/server/utils/firestore'

const reportSchema = z.object({
  reason: z.enum(['spam', 'inappropriate', 'copyright', 'other']),
  details: z.string().max(1000).optional(),
  reporterEmail: z.string().email().optional()
})

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Campaign slug is required'
    })
  }

  try {
    const body = await readBody(event)
    const payload = reportSchema.parse(body)

    const db = getFirestore()
    const snapshot = await db
      .collection(Collections.CAMPAIGNS)
      .where('slug', '==', slug)
      .limit(1)
      .get()

    if (snapshot.empty) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaign not found'
      })
    }

    const campaignDoc = snapshot.docs[0]
    const campaignId = campaignDoc.id
    const campaignData = campaignDoc.data() || {}

    await firestoreHelpers.recordAuditLog({
      action: 'campaign.reported',
      targetType: 'campaign',
      targetId: campaignId,
      metadata: {
        reason: payload.reason,
        details: payload.details,
        reporterEmail: payload.reporterEmail
      }
    })

    if (campaignData.status === 'active') {
      await firestoreHelpers.updateCampaignStatus(campaignId, 'suspended')

      await firestoreHelpers.recordAuditLog({
        actorUserId: null,
        action: 'campaign.suspended',
        targetType: 'campaign',
        targetId: campaignId,
        metadata: {
          reason: payload.reason
        }
      })
    }

    if (payload.reason === 'copyright' && typeof campaignData.userId === 'string') {
      const userRef = db.collection(Collections.USERS).doc(campaignData.userId)
      const userDoc = await userRef.get()
      const userData = userDoc.data()

      if (userDoc.exists && userData?.status === 'active') {
        const suspendedAt = firestoreHelpers.timestamp()

        await userRef.update({
          status: 'suspended',
          suspendedAt
        })

        await firestoreHelpers.recordAuditLog({
          actorUserId: null,
          action: 'user.suspended',
          targetType: 'user',
          targetId: campaignData.userId,
          metadata: {
            reason: 'copyright_report',
            campaignId
          }
        })
      }
    }

    return {
      success: true,
      message: 'Thank you for the report. Our team will review it shortly.'
    }
  } catch (error: any) {
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 422,
        statusMessage: error.issues[0]?.message || 'Invalid report payload'
      })
    }

    if (error.statusCode) {
      throw error
    }

    console.error('Error reporting campaign:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
