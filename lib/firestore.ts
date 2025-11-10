import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  increment,
  setDoc
} from 'firebase/firestore'
import { db } from './firebase'

export interface Campaign {
  id?: string
  campaignName: string
  slug: string
  description?: string
  visibility: 'Public' | 'Unlisted'
  frameURL: string
  status: 'Active' | 'Inactive'
  supportersCount: number
  createdBy: string
  createdByEmail?: string
  createdAt: any
}

// Campaign CRUD operations
export const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'supportersCount'>) => {
  try {
    console.log('createCampaign: Input data:', campaignData)
    
    // Filter out undefined values to prevent Firestore errors
    const cleanData: any = {
      campaignName: campaignData.campaignName,
      slug: campaignData.slug,
      visibility: campaignData.visibility,
      frameURL: campaignData.frameURL,
      status: campaignData.status,
      createdBy: campaignData.createdBy,
      supportersCount: 0,
      createdAt: serverTimestamp()
    }
    
    // Only add description if it's not undefined or empty
    if (campaignData.description && campaignData.description.trim()) {
      cleanData.description = campaignData.description.trim()
    }
    
    console.log('createCampaign: Clean data to save:', cleanData)
    
    const docRef = await addDoc(collection(db, 'campaigns'), cleanData)
    console.log('createCampaign: Campaign created with ID:', docRef.id)
    
    return { id: docRef.id, error: null }
  } catch (error: any) {
    console.error('createCampaign: Error creating campaign:', error)
    return { id: null, error: error.message }
  }
}

export const getCampaign = async (id: string): Promise<Campaign | null> => {
  try {
    const docRef = doc(db, 'campaigns', id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Campaign
    }
    return null
  } catch (error) {
    console.error('Error getting campaign:', error)
    return null
  }
}

export const getCampaignBySlug = async (slug: string): Promise<Campaign | null> => {
  try {
    console.log('getCampaignBySlug: Searching for slug:', slug)
    const q = query(collection(db, 'campaigns'), where('slug', '==', slug))
    const querySnapshot = await getDocs(q)
    
    console.log('getCampaignBySlug: Query result size:', querySnapshot.size)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const campaignData = { id: doc.id, ...doc.data() } as Campaign
      console.log('getCampaignBySlug: Found campaign:', campaignData)
      return campaignData
    }
    
    console.log('getCampaignBySlug: No campaign found with slug:', slug)
    return null
  } catch (error) {
    console.error('Error getting campaign by slug:', error)
    return null
  }
}

export const getUserCampaigns = async (userId: string): Promise<Campaign[]> => {
  try {
    console.log('Fetching campaigns for user:', userId)
    
    // First try with ordering
    let q = query(
      collection(db, 'campaigns'), 
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    let querySnapshot
    try {
      querySnapshot = await getDocs(q)
      console.log('Query with orderBy successful, found:', querySnapshot.size, 'campaigns')
    } catch (orderError) {
      console.warn('OrderBy query failed, trying without ordering:', orderError)
      // Fallback: query without ordering if index doesn't exist
      q = query(
        collection(db, 'campaigns'), 
        where('createdBy', '==', userId)
      )
      querySnapshot = await getDocs(q)
      console.log('Query without orderBy successful, found:', querySnapshot.size, 'campaigns')
    }
    
    const campaigns = querySnapshot.docs.map(doc => {
      const data = doc.data()
      console.log('Campaign data:', { id: doc.id, ...data })
      return {
        id: doc.id,
        ...data
      }
    }) as Campaign[]
    
    // Sort manually if we couldn't use orderBy
    campaigns.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0)
      const bTime = b.createdAt?.toDate?.() || new Date(0)
      return bTime.getTime() - aTime.getTime()
    })
    
    console.log('Returning campaigns:', campaigns.length)
    return campaigns
  } catch (error) {
    console.error('Error getting user campaigns:', error)
    return []
  }
}

export const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
  try {
    const docRef = doc(db, 'campaigns', id)
    
    // Filter out undefined values
    const cleanUpdates: any = {}
    Object.keys(updates).forEach(key => {
      const value = (updates as any)[key]
      if (value !== undefined) {
        if (key === 'description') {
          // Only add description if it has content, otherwise skip it
          if (value && value.trim()) {
            cleanUpdates[key] = value.trim()
          }
        } else {
          cleanUpdates[key] = value
        }
      }
    })
    
    await updateDoc(docRef, cleanUpdates)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const deleteCampaign = async (id: string) => {
  try {
    const docRef = doc(db, 'campaigns', id)
    await deleteDoc(docRef)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const incrementSupportersCount = async (campaignId: string) => {
  try {
    const docRef = doc(db, 'campaigns', campaignId)
    await updateDoc(docRef, {
      supportersCount: increment(1)
    })
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Get public active campaigns for landing page search
export const getPublicActiveCampaigns = async (): Promise<Campaign[]> => {
  try {
    console.log('getPublicActiveCampaigns: Fetching public active campaigns')
    
    const q = query(
      collection(db, 'campaigns'),
      where('visibility', '==', 'Public'),
      where('status', '==', 'Active'),
      orderBy('createdAt', 'desc')
    )
    
    let querySnapshot
    try {
      querySnapshot = await getDocs(q)
      console.log('getPublicActiveCampaigns: Query successful, found:', querySnapshot.size, 'campaigns')
    } catch (orderError) {
      console.warn('getPublicActiveCampaigns: OrderBy query failed, trying without ordering:', orderError)
      // Fallback: query without ordering if index doesn't exist
      const fallbackQuery = query(
        collection(db, 'campaigns'),
        where('visibility', '==', 'Public'),
        where('status', '==', 'Active')
      )
      querySnapshot = await getDocs(fallbackQuery)
      console.log('getPublicActiveCampaigns: Fallback query successful, found:', querySnapshot.size, 'campaigns')
    }
    
    const campaigns = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Campaign[]
    
    // Sort manually if we couldn't use orderBy
    campaigns.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0)
      const bTime = b.createdAt?.toDate?.() || new Date(0)
      return bTime.getTime() - aTime.getTime()
    })
    
    console.log('getPublicActiveCampaigns: Returning', campaigns.length, 'campaigns')
    return campaigns
  } catch (error) {
    console.error('Error getting public active campaigns:', error)
    return []
  }
}

// Debug function to list all campaigns
export const getAllCampaigns = async (): Promise<Campaign[]> => {
  try {
    console.log('getAllCampaigns: Fetching all campaigns')
    const querySnapshot = await getDocs(collection(db, 'campaigns'))
    
    const campaigns = querySnapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() } as Campaign
      console.log('getAllCampaigns: Campaign found:', { id: doc.id, slug: data.slug, name: data.campaignName })
      return data
    })
    
    console.log('getAllCampaigns: Total campaigns:', campaigns.length)
    return campaigns
  } catch (error) {
    console.error('Error getting all campaigns:', error)
    return []
  }
}

// Utility function to generate unique slug
export const generateUniqueSlug = async (baseName: string): Promise<string> => {
  const baseSlug = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  
  let slug = baseSlug
  let counter = 1
  
  while (true) {
    const existing = await getCampaignBySlug(slug)
    if (!existing) {
      return slug
    }
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

// Analytics and Stats Functions

export interface DailyStats {
  date: string // YYYY-MM-DD
  visits: number
  downloads: number
}

export interface CampaignStatsDaily {
  campaignId: string
  date: string
  visits: number
  downloads: number
  createdAt: any
  updatedAt: any
}

// Get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Generate stat document ID
const getStatDocId = (campaignId: string, date: string): string => {
  return `${campaignId}-${date}`
}

// Increment campaign visit count
export const incrementCampaignVisit = async (campaignId: string): Promise<void> => {
  try {
    const date = getTodayDate()
    const statDocId = getStatDocId(campaignId, date)
    const statRef = doc(db, 'CampaignStatsDaily', statDocId)
    
    const statSnap = await getDoc(statRef)
    
    if (statSnap.exists()) {
      // Update existing document
      await updateDoc(statRef, {
        visits: increment(1),
        updatedAt: serverTimestamp()
      })
    } else {
      // Create new document
      await updateDoc(statRef, {
        campaignId,
        date,
        visits: 1,
        downloads: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
  } catch (error) {
    // If document doesn't exist, create it
    try {
      const date = getTodayDate()
      const statDocId = getStatDocId(campaignId, date)
      const statRef = doc(db, 'CampaignStatsDaily', statDocId)
      
      await setDoc(statRef, {
        campaignId,
        date,
        visits: 1,
        downloads: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    } catch (createError) {
      console.error('Error incrementing campaign visit:', createError)
    }
  }
}

// Increment campaign download count
export const incrementCampaignDownload = async (campaignId: string): Promise<void> => {
  try {
    const date = getTodayDate()
    const statDocId = getStatDocId(campaignId, date)
    const statRef = doc(db, 'CampaignStatsDaily', statDocId)
    
    const statSnap = await getDoc(statRef)
    
    if (statSnap.exists()) {
      // Update existing document
      await updateDoc(statRef, {
        downloads: increment(1),
        updatedAt: serverTimestamp()
      })
    } else {
      // Create new document
      await updateDoc(statRef, {
        campaignId,
        date,
        visits: 0,
        downloads: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
  } catch (error) {
    // If document doesn't exist, create it
    try {
      const date = getTodayDate()
      const statDocId = getStatDocId(campaignId, date)
      const statRef = doc(db, 'CampaignStatsDaily', statDocId)
      
      await setDoc(statRef, {
        campaignId,
        date,
        visits: 0,
        downloads: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    } catch (createError) {
      console.error('Error incrementing campaign download:', createError)
    }
  }
}

// Get campaign stats for a specific date range
export const getCampaignStats = async (campaignId: string, days: number = 30): Promise<DailyStats[]> => {
  try {
    const statsRef = collection(db, 'CampaignStatsDaily')
    const q = query(
      statsRef,
      where('campaignId', '==', campaignId),
      orderBy('date', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const stats: DailyStats[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as CampaignStatsDaily
      stats.push({
        date: data.date,
        visits: data.visits || 0,
        downloads: data.downloads || 0
      })
    })
    
    // Filter to last N days and sort ascending
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const cutoffStr = cutoffDate.toISOString().split('T')[0]
    
    return stats
      .filter(stat => stat.date >= cutoffStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-days)
  } catch (error) {
    console.error('Error getting campaign stats:', error)
    return []
  }
}

// Get aggregate stats for a user (all their campaigns)
export const getUserAggregateStats = async (userId: string): Promise<{ visits: number; downloads: number }> => {
  try {
    // First, get all campaigns for the user
    const campaigns = await getUserCampaigns(userId)
    const campaignIds = campaigns.map(c => c.id).filter(Boolean) as string[]
    
    if (campaignIds.length === 0) {
      return { visits: 0, downloads: 0 }
    }
    
    let totalVisits = 0
    let totalDownloads = 0
    
    // Get stats for each campaign
    for (const campaignId of campaignIds) {
      const statsRef = collection(db, 'CampaignStatsDaily')
      const q = query(statsRef, where('campaignId', '==', campaignId))
      const querySnapshot = await getDocs(q)
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as CampaignStatsDaily
        totalVisits += data.visits || 0
        totalDownloads += data.downloads || 0
      })
    }
    
    return { visits: totalVisits, downloads: totalDownloads }
  } catch (error) {
    console.error('Error getting user aggregate stats:', error)
    return { visits: 0, downloads: 0 }
  }
}

// Get daily stats for all user campaigns (for dashboard chart)
export const getUserDailyStats = async (userId: string, days: number = 30): Promise<DailyStats[]> => {
  try {
    // Get all campaigns for the user
    const campaigns = await getUserCampaigns(userId)
    const campaignIds = campaigns.map(c => c.id).filter(Boolean) as string[]
    
    if (campaignIds.length === 0) {
      return []
    }
    
    // Create a map to aggregate stats by date
    const statsByDate = new Map<string, { visits: number; downloads: number }>()
    
    // Get stats for each campaign
    for (const campaignId of campaignIds) {
      const stats = await getCampaignStats(campaignId, days)
      
      stats.forEach(stat => {
        const existing = statsByDate.get(stat.date) || { visits: 0, downloads: 0 }
        statsByDate.set(stat.date, {
          visits: existing.visits + stat.visits,
          downloads: existing.downloads + stat.downloads
        })
      })
    }
    
    // Convert map to array and sort by date
    const result: DailyStats[] = Array.from(statsByDate.entries())
      .map(([date, stats]) => ({
        date,
        visits: stats.visits,
        downloads: stats.downloads
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
    
    // Fill in missing dates with zeros
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const filledStats: DailyStats[] = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date(cutoffDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      
      const existing = result.find(s => s.date === dateStr)
      filledStats.push(existing || { date: dateStr, visits: 0, downloads: 0 })
    }
    
    return filledStats
  } catch (error) {
    console.error('Error getting user daily stats:', error)
    return []
  }
}
