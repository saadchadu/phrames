import { getFirebaseAdmin } from './firebase-admin'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore'

// Server-side Firestore helpers using Admin SDK
export const firestoreHelpers = {
  // Generate ID
  generateId: () => {
    const firebase = getFirebaseAdmin()
    if (!firebase) throw new Error('Firebase not initialized')
    return firebase.db.collection('_').doc().id
  },

  // Get user by Firebase UID
  async getUserByFirebaseUid(uid: string) {
    const firebase = getFirebaseAdmin()
    if (!firebase) throw new Error('Firebase not initialized')

    const snapshot = await firebase.db
      .collection('users')
      .where('firebaseUid', '==', uid)
      .limit(1)
      .get()
    
    if (snapshot.empty) return null
    
    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() }
  },

  // Create user
  async createUser(data: {
    firebaseUid: string
    email: string
    emailVerified?: boolean
    status?: string
  }) {
    const firebase = getFirebaseAdmin()
    if (!firebase) throw new Error('Firebase not initialized')

    const userId = this.generateId()
    const now = Timestamp.now()
    
    const userData = {
      ...data,
      emailVerified: data.emailVerified ?? false,
      status: data.status ?? 'active',
      createdAt: now,
      updatedAt: now
    }
    
    await firebase.db.collection('users').doc(userId).set(userData)
    
    return { id: userId, ...userData }
  },

  // Get user by ID
  async getUserById(userId: string) {
    const firebase = getFirebaseAdmin()
    if (!firebase) throw new Error('Firebase not initialized')

    const doc = await firebase.db.collection('users').doc(userId).get()
    
    if (!doc.exists) return null
    
    return { id: doc.id, ...doc.data() }
  },

  // Create campaign
  async createCampaign(data: {
    userId: string
    name: string
    slug: string
    description?: string
    visibility: 'public' | 'unlisted'
    frameUrl: string
    frameWidth: number
    frameHeight: number
  }) {
    const firebase = getFirebaseAdmin()
    if (!firebase) throw new Error('Firebase not initialized')

    const campaignId = this.generateId()
    const now = Timestamp.now()

    const campaignData = {
      ...data,
      createdAt: now,
      updatedAt: now,
      status: 'active'
    }

    await firebase.db.collection('campaigns').doc(campaignId).set(campaignData)

    return { id: campaignId, ...campaignData }
  },

  // Get campaign by slug
  async getCampaignBySlug(slug: string) {
    const firebase = getFirebaseAdmin()
    if (!firebase) throw new Error('Firebase not initialized')

    const snapshot = await firebase.db
      .collection('campaigns')
      .where('slug', '==', slug)
      .limit(1)
      .get()

    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() }
  },

  // Get campaigns by user
  async getCampaignsByUser(userId: string) {
    const firebase = getFirebaseAdmin()
    if (!firebase) throw new Error('Firebase not initialized')

    const snapshot = await firebase.db
      .collection('campaigns')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get()

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  },

  // Increment campaign stats
  async incrementCampaignStat(campaignId: string, statType: 'visits' | 'renders' | 'downloads') {
    const firebase = getFirebaseAdmin()
    if (!firebase) throw new Error('Firebase not initialized')

    const today = new Date().toISOString().split('T')[0]
    const statsId = `${campaignId}_${today}`
    const statsRef = firebase.db.collection('campaign_stats').doc(statsId)

    try {
      await firebase.db.runTransaction(async (transaction) => {
        const doc = await transaction.get(statsRef)
        
        if (!doc.exists) {
          transaction.set(statsRef, {
            campaignId,
            date: today,
            visits: statType === 'visits' ? 1 : 0,
            renders: statType === 'renders' ? 1 : 0,
            downloads: statType === 'downloads' ? 1 : 0,
            createdAt: Timestamp.now()
          })
        } else {
          const currentData = doc.data()
          const updates: any = {}
          
          if (statType === 'visits') {
            updates.visits = (currentData?.visits || 0) + 1
          } else if (statType === 'renders') {
            updates.renders = (currentData?.renders || 0) + 1
          } else if (statType === 'downloads') {
            updates.downloads = (currentData?.downloads || 0) + 1
          }
          
          transaction.update(statsRef, updates)
        }
      })
    } catch (error) {
      console.error('Error incrementing campaign stat:', error)
    }
  }
}