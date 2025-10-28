import { getUserFromEvent } from '~/server/utils/auth'
import { firestoreHelpers, getFirestore, Collections } from '~/server/utils/firestore'

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

  const campaign = await firestoreHelpers.getCampaignById(campaignId)

  if (!campaign) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Campaign not found'
    })
  }

  return {
    campaign
  }
})
