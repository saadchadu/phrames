export default defineEventHandler(async (event) => {
  try {
    const { getFirestore, Collections } = await import('~/server/utils/firestore')
    const db = getFirestore()
    
    // Get all campaigns
    const campaignsSnapshot = await db.collection(Collections.CAMPAIGNS).limit(10).get()
    
    const campaigns = campaignsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return {
      success: true,
      count: campaigns.length,
      campaigns: campaigns.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        userId: c.userId,
        status: c.status,
        frameAssetId: c.frameAssetId,
        thumbnailAssetId: c.thumbnailAssetId
      }))
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    }
  }
})