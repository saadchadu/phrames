import { FieldValue } from 'firebase-admin/firestore'
import type { DocumentSnapshot } from 'firebase-admin/firestore'
import { getFirebaseAdmin } from './firebase-admin'

// Collection names
export const Collections = {
  USERS: 'users',
  SESSIONS: 'sessions',
  CAMPAIGNS: 'campaigns',
  ASSETS: 'assets',
  CAMPAIGN_STATS: 'campaign_stats_daily',
  AUDIT_LOGS: 'audit_logs',
  SLUG_HISTORY: 'campaign_slug_history'
} as const

const IN_QUERY_LIMIT = 10

type AssetType = 'frame_png' | 'thumb_png'
type CampaignVisibility = 'public' | 'unlisted'
type CampaignStatus = 'active' | 'archived' | 'suspended'

interface FirestoreAssetDoc {
  ownerUserId: string
  type: AssetType
  storageKey: string
  width: number
  height: number
  sizeBytes: number
  createdAt: string
}

interface FirestoreCampaignDoc {
  userId: string
  name: string
  slug: string
  description?: string | null
  visibility: CampaignVisibility
  status: CampaignStatus
  frameAssetId: string
  thumbnailAssetId?: string | null
  aspectRatio: string
  createdAt: string
  updatedAt: string
}

type CampaignMetrics = {
  visits: number
  renders: number
  downloads: number
}

const createEmptyMetrics = (): CampaignMetrics => ({
  visits: 0,
  renders: 0,
  downloads: 0
})

function getFirestore() {
  const firebase = getFirebaseAdmin()
  if (!firebase) {
    throw new Error('Firebase Admin not initialized')
  }
  return firebase.firestore
}

// Helper functions for common operations
export const firestoreHelpers = {
  // Generate ID
  generateId: () => getFirestore().collection('_').doc().id,

  // Timestamp
  timestamp: () => new Date().toISOString(),

  // Get user by Firebase UID
  async getUserByFirebaseUid(uid: string) {
    const db = getFirestore()
    const snapshot = await db.collection(Collections.USERS)
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
    const db = getFirestore()
    const userId = this.generateId()
    const now = this.timestamp()
    
    const userData = {
      ...data,
      emailVerified: data.emailVerified ?? false,
      status: data.status ?? 'active',
      createdAt: now,
      updatedAt: now
    }
    
    await db.collection(Collections.USERS).doc(userId).set(userData)
    
    return { id: userId, ...userData }
  },

  // Create session
  async createSession(userId: string) {
    const db = getFirestore()
    const sessionId = this.generateId()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    
    const sessionData = {
      userId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    }
    
    await db.collection(Collections.SESSIONS).doc(sessionId).set(sessionData)
    
    return sessionId
  },

  // Get session
  async getSession(sessionId: string) {
    const db = getFirestore()
    const doc = await db.collection(Collections.SESSIONS).doc(sessionId).get()
    
    if (!doc.exists) return null
    
    const data = doc.data()
    const now = new Date()
    const expiresAt = new Date(data!.expiresAt)
    
    if (expiresAt < now) {
      // Session expired, delete it
      await doc.ref.delete()
      return null
    }
    
    return { id: doc.id, ...data }
  },

  // Delete session
  async deleteSession(sessionId: string) {
    const db = getFirestore()
    await db.collection(Collections.SESSIONS).doc(sessionId).delete()
  },

  // Get user by ID
  async getUserById(userId: string) {
    const db = getFirestore()
    const doc = await db.collection(Collections.USERS).doc(userId).get()
    
    if (!doc.exists) return null
    
    return { id: doc.id, ...doc.data() }
  },

  // Create campaign
  async createCampaign(data: {
    userId: string
    name: string
    slug: string
    description?: string | null
    visibility: CampaignVisibility
    status?: CampaignStatus
    frameAssetId: string
    thumbnailAssetId?: string | null
    aspectRatio: string
  }) {
    const db = getFirestore()
    const campaignId = this.generateId()
    const now = this.timestamp()

    const docData: FirestoreCampaignDoc = {
      userId: data.userId,
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      visibility: data.visibility,
      status: data.status ?? 'active',
      frameAssetId: data.frameAssetId,
      thumbnailAssetId: data.thumbnailAssetId ?? null,
      aspectRatio: data.aspectRatio,
      createdAt: now,
      updatedAt: now
    }

    await db.collection(Collections.CAMPAIGNS).doc(campaignId).set(docData)

    return { id: campaignId, ...docData }
  },

  // Get campaigns by user
  async listCampaignsByUser(userId: string, options: { offset?: number; limit?: number } = {}) {
    const db = getFirestore()
    const offset = options.offset ?? 0
    const limit = Math.max(options.limit ?? 10, 1)

    const snapshot = await db
      .collection(Collections.CAMPAIGNS)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .offset(offset)
      .limit(limit)
      .get()

    const campaigns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return { campaigns, total: campaigns.length }
  },

  // Get campaign by slug
  async getCampaignBySlug(slug: string) {
    const db = getFirestore()
    const snapshot = await db
      .collection(Collections.CAMPAIGNS)
      .where('slug', '==', slug)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return null
    }

    const doc = snapshot.docs[0]
    const campaignData = { id: doc.id, ...doc.data() } as any

    // Get frame asset
    const frameAsset = await this.getAssetById(campaignData.frameAssetId)
    if (!frameAsset) {
      return null
    }

    return {
      id: campaignData.id,
      name: campaignData.name,
      slug: campaignData.slug,
      description: campaignData.description || '',
      visibility: campaignData.visibility,
      status: campaignData.status,
      frameAsset: {
        id: frameAsset.id,
        url: this.getAssetUrl(frameAsset),
        width: frameAsset.width,
        height: frameAsset.height
      },
      createdAt: campaignData.createdAt,
      updatedAt: campaignData.updatedAt
    }
  },

  // Get asset by ID
  async getAssetById(assetId: string) {
    const db = getFirestore()
    const doc = await db.collection(Collections.ASSETS).doc(assetId).get()

    if (!doc.exists) {
      return null
    }

    return { id: doc.id, ...doc.data() }
  },

  // Get asset URL
  getAssetUrl(asset: any): string {
    // Check if it's a Firebase Storage URL (starts with https://)
    if (asset.storageKey.startsWith('https://')) {
      return asset.storageKey
    }
    // Check if it's already a local storage path (starts with /uploads/)
    else if (asset.storageKey.startsWith('/uploads/')) {
      return asset.storageKey
    }
    // Check if it's a local storage key (starts with frames/ or thumbs/)
    else if (asset.storageKey.startsWith('frames/') || asset.storageKey.startsWith('thumbs/')) {
      return `/uploads/${asset.storageKey}`
    }
    // Otherwise assume Firebase Storage
    else {
      return `https://storage.googleapis.com/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/${asset.storageKey}`
    }
  },

  // Increment campaign metric
  async incrementCampaignMetric(campaignId: string, dateKey: string, metric: 'visit' | 'render' | 'download') {
    const db = getFirestore()
    const statsId = `${campaignId}_${dateKey}`
    const statsRef = db.collection(Collections.CAMPAIGN_STATS).doc(statsId)

    try {
      await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(statsRef)
        const now = this.timestamp()

        if (!snapshot.exists) {
          transaction.set(statsRef, {
            campaignId,
            date: dateKey,
            visits: metric === 'visit' ? 1 : 0,
            renders: metric === 'render' ? 1 : 0,
            downloads: metric === 'download' ? 1 : 0,
            createdAt: now,
            updatedAt: now
          })
          return
        }

        const currentData = snapshot.data()
        const updates: any = {
          updatedAt: now
        }

        if (metric === 'visit') {
          updates.visits = (currentData?.visits || 0) + 1
        }
        if (metric === 'render') {
          updates.renders = (currentData?.renders || 0) + 1
        }
        if (metric === 'download') {
          updates.downloads = (currentData?.downloads || 0) + 1
        }

        transaction.update(statsRef, updates)
      })
    } catch (error) {
      console.error('Error incrementing campaign metric:', error)
    }
  }
}