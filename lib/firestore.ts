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
  aspectRatio?: '1:1' | '4:5' | '3:4' // Frame aspect ratio
  status: 'Active' | 'Inactive'
  supportersCount: number
  createdBy: string
  createdByEmail?: string
  createdAt: any
  
  // Payment-related fields
  isFreeCampaign: boolean // true for first free campaign, false for paid
  isActive: boolean
  planType?: 'free' | 'week' | 'month' | '3month' | '6month' | 'year'
  amountPaid?: number
  paymentId?: string | null
  expiresAt?: any | null // Timestamp - null for free campaigns
  lastPaymentAt?: any // Timestamp
  
  // Trending data (computed fields, not stored in Firestore)
  weeklyDownloads?: number
  trendingScore?: number
}

export interface User {
  uid: string
  email: string
  displayName?: string
  freeCampaignUsed: boolean // Default: false, set to true after first campaign
}

// Campaign CRUD operations
export const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'supportersCount'>) => {
  try {
    // Check if user is blocked
    const userDoc = await getDoc(doc(db, 'users', campaignData.createdBy))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      if (userData?.isBlocked === true) {
        console.error('createCampaign: User is blocked')
        return { id: null, error: 'Your account has been blocked. You cannot create campaigns at this time.' }
      }
    }
    
    // Check if slug already exists
    const existingCampaign = await getCampaignBySlug(campaignData.slug)
    if (existingCampaign) {
      console.error('createCampaign: Slug already exists')
      return { id: null, error: 'This URL slug is already taken. Please choose a different one.' }
    }
    
    // Filter out undefined values to prevent Firestore errors
    const cleanData: any = {
      campaignName: campaignData.campaignName,
      slug: campaignData.slug,
      visibility: campaignData.visibility,
      frameURL: campaignData.frameURL,
      status: 'Inactive', // Always start as inactive
      createdBy: campaignData.createdBy,
      supportersCount: 0,
      createdAt: serverTimestamp(),
      isActive: false, // Requires payment to activate
    }
    
    // Add createdByEmail if provided
    if (campaignData.createdByEmail) {
      cleanData.createdByEmail = campaignData.createdByEmail
    }
    
    // Only add description if it's not undefined or empty
    if (campaignData.description && campaignData.description.trim()) {
      cleanData.description = campaignData.description.trim()
    }
    
    const docRef = await addDoc(collection(db, 'campaigns'), cleanData)
    
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
    const q = query(collection(db, 'campaigns'), where('slug', '==', slug))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const campaignData = { id: doc.id, ...doc.data() } as Campaign
      return campaignData
    }
    
    return null
  } catch (error) {
    console.error('Error getting campaign by slug:', error)
    return null
  }
}

export const getUserCampaigns = async (userId: string): Promise<Campaign[]> => {
  try {
    // First try with ordering
    let q = query(
      collection(db, 'campaigns'), 
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    let querySnapshot
    try {
      querySnapshot = await getDocs(q)
    } catch (orderError) {
      // Fallback: query without ordering if index doesn't exist
      q = query(
        collection(db, 'campaigns'), 
        where('createdBy', '==', userId)
      )
      querySnapshot = await getDocs(q)
    }
    
    const campaigns = querySnapshot.docs.map(doc => {
      const data = doc.data()
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

// DEPRECATED: Use addSupporter from @/lib/supporters instead
// This function is kept for backward compatibility but should not be used
export const incrementSupportersCount = async (campaignId: string) => {
  console.warn('incrementSupportersCount is deprecated. Use addSupporter from @/lib/supporters instead.')
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
    const q = query(
      collection(db, 'campaigns'),
      where('visibility', '==', 'Public'),
      where('status', '==', 'Active'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    )
    
    let querySnapshot
    try {
      querySnapshot = await getDocs(q)
    } catch (orderError) {
      console.warn('getPublicActiveCampaigns: OrderBy query failed, trying without ordering:', orderError)
      // Fallback: query without ordering if index doesn't exist
      const fallbackQuery = query(
        collection(db, 'campaigns'),
        where('visibility', '==', 'Public'),
        where('status', '==', 'Active'),
        where('isActive', '==', true)
      )
      querySnapshot = await getDocs(fallbackQuery)
    }
    
    const campaigns = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Campaign[]
    
    // Additional client-side filter to ensure both status and isActive are true
    const activeCampaigns = campaigns.filter(campaign => 
      campaign.status === 'Active' && campaign.isActive === true
    )
    
    // Sort manually if we couldn't use orderBy
    activeCampaigns.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0)
      const bTime = b.createdAt?.toDate?.() || new Date(0)
      return bTime.getTime() - aTime.getTime()
    })
    
    return activeCampaigns
  } catch (error) {
    console.error('Error getting public active campaigns:', error)
    return []
  }
}

// Debug function to list all campaigns
export const getAllCampaigns = async (): Promise<Campaign[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'campaigns'))
    
    const campaigns = querySnapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() } as Campaign
      return data
    })
    
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

    // Get the last N days
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0]

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.date >= cutoffDateStr) {
        stats.push({
          date: data.date,
          visits: data.visits || 0,
          downloads: data.downloads || 0
        })
      }
    })

    return stats
  } catch (error) {
    console.error('Error getting campaign stats:', error)
    return []
  }
}

// Get weekly downloads for a campaign
export const getCampaignWeeklyDownloads = async (campaignId: string): Promise<number> => {
  try {
    const statsRef = collection(db, 'CampaignStatsDaily')
    
    // Get last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const cutoffDateStr = sevenDaysAgo.toISOString().split('T')[0]
    
    const q = query(
      statsRef,
      where('campaignId', '==', campaignId),
      where('date', '>=', cutoffDateStr)
    )
    
    const querySnapshot = await getDocs(q)
    let totalDownloads = 0
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      totalDownloads += data.downloads || 0
    })
    
    return totalDownloads
  } catch (error) {
    console.error('Error getting weekly downloads:', error)
    return 0
  }
}

// Get trending campaigns based on weekly downloads and supporters count
export const getTrendingCampaigns = async (limit: number = 8): Promise<Campaign[]> => {
  try {
    // Get all active public campaigns with pre-calculated trending scores
    const campaignsRef = collection(db, 'campaigns')
    const q = query(
      campaignsRef,
      where('visibility', '==', 'Public'),
      where('status', '==', 'Active'),
      where('isActive', '==', true),
      orderBy('trendingScore', 'desc'),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const campaigns: Campaign[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      campaigns.push({
        id: doc.id,
        campaignName: data.campaignName,
        slug: data.slug,
        description: data.description,
        visibility: data.visibility,
        frameURL: data.frameURL,
        aspectRatio: data.aspectRatio,
        status: data.status,
        supportersCount: data.supportersCount || 0,
        createdBy: data.createdBy,
        createdByEmail: data.createdByEmail,
        createdAt: data.createdAt,
        isFreeCampaign: data.isFreeCampaign,
        isActive: data.isActive,
        planType: data.planType,
        amountPaid: data.amountPaid,
        paymentId: data.paymentId,
        expiresAt: data.expiresAt,
        lastPaymentAt: data.lastPaymentAt,
        weeklyDownloads: data.weeklyDownloads || 0,
        trendingScore: data.trendingScore || 0
      } as Campaign)
    })
    
    // If no campaigns have trending scores yet, fall back to supporters count
    if (campaigns.length === 0 || campaigns.every(c => !c.trendingScore)) {
      const fallbackCampaigns = await getPublicActiveCampaigns()
      return fallbackCampaigns
        .sort((a, b) => (b.supportersCount || 0) - (a.supportersCount || 0))
        .slice(0, limit)
    }
    
    return campaigns.slice(0, limit)
  } catch (error) {
    console.error('Error getting trending campaigns:', error)
    
    // Fallback to basic sorting by supporters count
    try {
      const fallbackCampaigns = await getPublicActiveCampaigns()
      return fallbackCampaigns
        .sort((a, b) => (b.supportersCount || 0) - (a.supportersCount || 0))
        .slice(0, limit)
    } catch (fallbackError) {
      console.error('Error in fallback trending campaigns:', fallbackError)
      return []
    }
  }
}

// Calculate trending score based on supporters count and weekly downloads
const calculateTrendingScore = (supportersCount: number, weeklyDownloads: number): number => {
  // Weight: 70% supporters count, 30% weekly downloads
  // This gives more importance to supporters (long-term engagement) 
  // while still considering recent activity (weekly downloads)
  const supportersWeight = 0.7
  const downloadsWeight = 0.3
  
  // Normalize the values to prevent one metric from dominating
  // Use logarithmic scaling to handle large differences
  const normalizedSupporters = Math.log(supportersCount + 1) * 10
  const normalizedDownloads = Math.log(weeklyDownloads + 1) * 10
  
  return (normalizedSupporters * supportersWeight) + (normalizedDownloads * downloadsWeight)
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

// Payment Record Interface
export interface PaymentRecord {
  id?: string
  orderId: string
  campaignId: string
  userId: string
  planType: 'free' | 'week' | 'month' | '3month' | '6month' | 'year'
  amount: number
  currency: string
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  paymentMethod?: string
  cashfreeOrderId: string
  cashfreePaymentId?: string
  createdAt: any
  completedAt?: any
  metadata?: {
    campaignName: string
    userEmail: string
  }
}

// Expiry Log Interface
export interface ExpiryLog {
  id?: string
  campaignId: string
  campaignName: string
  userId: string
  expiredAt: any
  planType: string
  processedAt: any
  batchId: string
}

// Create payment record
export const createPaymentRecord = async (paymentData: Omit<PaymentRecord, 'id' | 'createdAt'>): Promise<{ id: string | null; error: string | null }> => {
  try {
    const docRef = await addDoc(collection(db, 'payments'), {
      ...paymentData,
      createdAt: serverTimestamp()
    })
    return { id: docRef.id, error: null }
  } catch (error: any) {
    console.error('Error creating payment record:', error)
    return { id: null, error: error.message }
  }
}

// Update payment record
export const updatePaymentRecord = async (id: string, updates: Partial<PaymentRecord>): Promise<{ error: string | null }> => {
  try {
    const docRef = doc(db, 'payments', id)
    await updateDoc(docRef, updates as any)
    return { error: null }
  } catch (error: any) {
    console.error('Error updating payment record:', error)
    return { error: error.message }
  }
}

// Get payment record by order ID
export const getPaymentByOrderId = async (orderId: string): Promise<PaymentRecord | null> => {
  try {
    // First try to find by orderId
    let q = query(collection(db, 'payments'), where('orderId', '==', orderId))
    let querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as PaymentRecord
    }
    
    // If not found, try to find by cashfreeOrderId
    q = query(collection(db, 'payments'), where('cashfreeOrderId', '==', orderId))
    querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as PaymentRecord
    }
    
    return null
  } catch (error) {
    console.error('Error getting payment by order ID:', error)
    return null
  }
}

// Create expiry log
export const createExpiryLog = async (logData: Omit<ExpiryLog, 'id' | 'processedAt'>): Promise<{ error: string | null }> => {
  try {
    await addDoc(collection(db, 'expiryLogs'), {
      ...logData,
      processedAt: serverTimestamp()
    })
    return { error: null }
  } catch (error: any) {
    console.error('Error creating expiry log:', error)
    return { error: error.message }
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

// Free Campaign Helper Functions

// Check if user is eligible for free campaign
export const checkFreeCampaignEligibility = async (userId: string): Promise<boolean> => {
  try {
    // First check if free campaigns are enabled in system settings
    const settingsDoc = await getDoc(doc(db, 'settings', 'system'))
    if (settingsDoc.exists()) {
      const settings = settingsDoc.data()
      if (settings.freeCampaignEnabled === false) {
        return false
      }
    }
    
    // Then check user eligibility
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      // New user - eligible for free campaign
      return true
    }
    const userData = userDoc.data()
    return userData?.freeCampaignUsed === false || userData?.freeCampaignUsed === undefined
  } catch (error) {
    console.error('Error checking free campaign eligibility:', error)
    return false
  }
}

// Activate free campaign (via API route to bypass Firestore rules)
export const activateFreeCampaign = async (campaignId: string, userId: string): Promise<{ error: string | null }> => {
  try {
    // Get the current user's ID token
    const { auth } = await import('./firebase')
    const user = auth.currentUser
    
    if (!user) {
      console.error('activateFreeCampaign: User not authenticated')
      return { error: 'User not authenticated' }
    }
    
    const idToken = await user.getIdToken()
    
    // Call the API route to activate the free campaign
    const response = await fetch('/api/campaigns/activate-free', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ campaignId })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return { error: data.error || 'Failed to activate free campaign' }
    }
    
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Get user document
export const getUserDocument = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      return userDoc.data() as User
    }
    return null
  } catch (error) {
    console.error('Error getting user document:', error)
    return null
  }
}

// Create or update user document
export const createOrUpdateUser = async (userId: string, userData: Partial<User>): Promise<{ error: string | null }> => {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      await updateDoc(userRef, userData as any)
    } else {
      await setDoc(userRef, {
        uid: userId,
        freeCampaignUsed: false,
        ...userData
      })
    }
    
    return { error: null }
  } catch (error: any) {
    console.error('Error creating/updating user:', error)
    return { error: error.message }
  }
}
