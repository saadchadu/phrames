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
  increment
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