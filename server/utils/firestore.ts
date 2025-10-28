import { FieldValue, Firestore } from '@google-cloud/firestore'
import type { DocumentSnapshot } from '@google-cloud/firestore'
import { getFirebaseAdmin } from './firebase'

let firestoreInstance: Firestore | null = null

export function getFirestore(): Firestore {
  if (firestoreInstance) {
    return firestoreInstance
  }

  const firebase = getFirebaseAdmin()
  if (!firebase) {
    throw new Error('Firebase Admin not initialized')
  }

  const config = useRuntimeConfig()

  try {
    // Initialize Firestore with explicit credentials
    firestoreInstance = new Firestore({
      projectId: config.firebaseProjectId,
      credentials: {
        client_email: config.firebaseClientEmail,
        private_key: config.firebasePrivateKey.replace(/\\n/g, '\n')
      }
    })

    console.log('✅ Firestore initialized successfully')
    return firestoreInstance
  } catch (error) {
    console.error('❌ Failed to initialize Firestore:', error)
    throw new Error(`Firestore initialization failed: ${error.message}`)
  }
}

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
type MetricKey = 'visits' | 'renders' | 'downloads'

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

interface FirestoreStatsDoc {
  campaignId: string
  date: string
  visits: number
  renders: number
  downloads: number
}

interface FirestoreSlugHistoryDoc {
  campaignId: string
  slug: string
  createdAt: string
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

function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) {
    return [items]
  }

  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

const docToCampaignRecord = (doc: DocumentSnapshot): (FirestoreCampaignDoc & { id: string }) | null => {
  if (!doc.exists) {
    return null
  }

  return {
    id: doc.id,
    ...(doc.data() as FirestoreCampaignDoc)
  }
}

const docToAssetRecord = (doc: DocumentSnapshot): (FirestoreAssetDoc & { id: string }) | null => {
  if (!doc.exists) {
    return null
  }

  return {
    id: doc.id,
    ...(doc.data() as FirestoreAssetDoc)
  }
}

const assetToResponse = (asset: FirestoreAssetDoc & { id: string }) => {
  // Determine URL based on storage type
  let url: string
  
  // Check if it's a Firebase Storage URL (starts with https://)
  if (asset.storageKey.startsWith('https://')) {
    url = asset.storageKey
  }
  // Check if it's already a local storage path (starts with /uploads/)
  else if (asset.storageKey.startsWith('/uploads/')) {
    url = asset.storageKey
  }
  // Check if it's a local storage key (starts with frames/ or thumbs/)
  else if (asset.storageKey.startsWith('frames/') || asset.storageKey.startsWith('thumbs/')) {
    url = `/uploads/${asset.storageKey}`
  }
  // Otherwise assume Firebase Storage
  else {
    const config = useRuntimeConfig()
    const bucketName = config.public.firebaseStorageBucket
    url = `https://storage.googleapis.com/${bucketName}/${asset.storageKey}`
  }
  
  return {
    id: asset.id,
    storageKey: asset.storageKey,
    width: asset.width,
    height: asset.height,
    sizeBytes: asset.sizeBytes,
    url
  }
}

async function loadAssetsMap(assetIds: string[]): Promise<Map<string, FirestoreAssetDoc & { id: string }>> {
  const map = new Map<string, FirestoreAssetDoc & { id: string }>()

  if (!assetIds.length) {
    return map
  }

  const uniqueIds = Array.from(new Set(assetIds))
  const db = getFirestore()
  const refs = uniqueIds.map((id) => db.collection(Collections.ASSETS).doc(id))

  const docs = await db.getAll(...refs)

  docs.forEach((doc) => {
    const record = docToAssetRecord(doc)
    if (record) {
      map.set(record.id, record)
    }
  })

  return map
}

function buildCampaignPayload(
  campaign: FirestoreCampaignDoc & { id: string },
  assets: Map<string, FirestoreAssetDoc & { id: string }>
) {
  const frameAsset = assets.get(campaign.frameAssetId)

  if (!frameAsset) {
    throw new Error(`Missing frame asset "${campaign.frameAssetId}" for campaign "${campaign.id}"`)
  }

  const thumbnailAsset = campaign.thumbnailAssetId ? assets.get(campaign.thumbnailAssetId) : null

  return {
    id: campaign.id,
    name: campaign.name,
    slug: campaign.slug,
    description: campaign.description ?? null,
    visibility: campaign.visibility,
    status: campaign.status,
    aspectRatio: campaign.aspectRatio,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    frameAsset: assetToResponse(frameAsset),
    thumbnailAsset: thumbnailAsset ? assetToResponse(thumbnailAsset) : null
  }
}

async function fetchCampaignTotals(campaignIds: string[]): Promise<Map<string, CampaignMetrics>> {
  const totals = new Map<string, CampaignMetrics>()

  if (!campaignIds.length) {
    return totals
  }

  // Seed map with zeroes to simplify lookups
  for (const id of campaignIds) {
    totals.set(id, createEmptyMetrics())
  }

  const db = getFirestore()

  for (const chunk of chunkArray(campaignIds, IN_QUERY_LIMIT)) {
    if (!chunk.length) {
      continue
    }

    const snapshot = await db
      .collection(Collections.CAMPAIGN_STATS)
      .where('campaignId', 'in', chunk)
      .get()

    snapshot.forEach((doc) => {
      const data = doc.data() as FirestoreStatsDoc
      const entry = totals.get(data.campaignId)
      if (!entry) {
        return
      }

      entry.visits += data.visits || 0
      entry.renders += data.renders || 0
      entry.downloads += data.downloads || 0
    })
  }

  return totals
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

  // Get user by email
  async getUserByEmail(email: string) {
    const db = getFirestore()
    const snapshot = await db.collection(Collections.USERS)
      .where('email', '==', email)
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

  // Assets
  async createAsset(data: {
    ownerUserId: string
    type: AssetType
    storageKey: string
    width: number
    height: number
    sizeBytes: number
  }) {
    const db = getFirestore()
    const assetId = this.generateId()
    const now = this.timestamp()

    const assetDoc: FirestoreAssetDoc = {
      ownerUserId: data.ownerUserId,
      type: data.type,
      storageKey: data.storageKey,
      width: data.width,
      height: data.height,
      sizeBytes: data.sizeBytes,
      createdAt: now
    }

    await db.collection(Collections.ASSETS).doc(assetId).set(assetDoc)

    return { id: assetId, ...assetDoc }
  },

  async getAssetById(assetId: string) {
    const db = getFirestore()
    const doc = await db.collection(Collections.ASSETS).doc(assetId).get()

    if (!doc.exists) {
      return null
    }

    const data = doc.data() as FirestoreAssetDoc
    return { id: doc.id, ...data }
  },

  async getCampaignById(campaignId: string) {
    const db = getFirestore()
    const doc = await db.collection(Collections.CAMPAIGNS).doc(campaignId).get()

    const record = docToCampaignRecord(doc)
    if (!record) {
      return null
    }

    const assetIds = [record.frameAssetId]
    if (record.thumbnailAssetId) {
      assetIds.push(record.thumbnailAssetId)
    }

    const assets = await loadAssetsMap(assetIds)
    return buildCampaignPayload(record, assets)
  },

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

    const record = docToCampaignRecord(snapshot.docs[0])
    if (!record) {
      return null
    }

    const assetIds = [record.frameAssetId]
    if (record.thumbnailAssetId) {
      assetIds.push(record.thumbnailAssetId)
    }

    const assets = await loadAssetsMap(assetIds)
    return buildCampaignPayload(record, assets)
  },

  async listCampaignsByUser(userId: string, options: { offset?: number; limit?: number } = {}) {
    try {
      console.log(`[firestore] Listing campaigns for user: ${userId}`)
      const db = getFirestore()
      const offset = options.offset ?? 0
      const limit = Math.max(options.limit ?? 10, 1)

      const baseQuery = db
        .collection(Collections.CAMPAIGNS)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')

      console.log(`[firestore] Fetching campaigns with offset=${offset}, limit=${limit}`)
      const listSnapshot = await baseQuery.offset(offset).limit(limit).get()
      console.log(`[firestore] Found ${listSnapshot.size} campaigns`)

      let total = 0
      try {
        const aggregateSnapshot = await baseQuery.count().get()
        total = aggregateSnapshot.data().count || 0
      } catch (error) {
        console.warn('[firestore] Failed to run campaigns count aggregation – falling back to size.', error)
        const fallbackSnapshot = await db
          .collection(Collections.CAMPAIGNS)
          .where('userId', '==', userId)
          .get()
        total = fallbackSnapshot.size
      }

      const campaignRecords = listSnapshot.docs
        .map((doc) => docToCampaignRecord(doc))
        .filter((campaign): campaign is FirestoreCampaignDoc & { id: string } => Boolean(campaign))

      console.log(`[firestore] Processed ${campaignRecords.length} campaign records`)

      const assetIds = campaignRecords.flatMap((record) => {
        const ids = [record.frameAssetId]
        if (record.thumbnailAssetId) {
          ids.push(record.thumbnailAssetId)
        }
        return ids
      })

      console.log(`[firestore] Loading ${assetIds.length} assets`)
      const assets = await loadAssetsMap(assetIds)
      
      console.log(`[firestore] Fetching campaign totals`)
      const totals = await fetchCampaignTotals(campaignRecords.map((record) => record.id))

      const campaigns = campaignRecords.map((record) => {
        const base = buildCampaignPayload(record, assets)
        return {
          ...base,
          metrics: totals.get(record.id) || createEmptyMetrics()
        }
      })

      console.log(`[firestore] Returning ${campaigns.length} campaigns`)
      return {
        campaigns,
        total
      }
    } catch (error) {
      console.error('[firestore] Error in listCampaignsByUser:', error)
      throw error
    }
  },

  async isSlugTaken(slug: string, excludeCampaignId?: string) {
    const db = getFirestore()
    const snapshot = await db
      .collection(Collections.CAMPAIGNS)
      .where('slug', '==', slug)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return false
    }

    const doc = snapshot.docs[0]
    if (excludeCampaignId && doc.id === excludeCampaignId) {
      return false
    }

    return true
  },

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

    return await this.getCampaignById(campaignId)
  },

  async updateCampaign(
    campaignId: string,
    updates: Partial<{
      name: string
      slug: string
      description: string | null
      visibility: CampaignVisibility
      status: CampaignStatus
      frameAssetId: string
      thumbnailAssetId: string | null
      aspectRatio: string
    }>
  ) {
    const db = getFirestore()
    const campaignRef = db.collection(Collections.CAMPAIGNS).doc(campaignId)

    await db.runTransaction(async (tx) => {
      const snapshot = await tx.get(campaignRef)

      if (!snapshot.exists) {
        throw new Error('CAMPAIGN_NOT_FOUND')
      }

      const current = snapshot.data() as FirestoreCampaignDoc
      const now = this.timestamp()
      const payload: Record<string, any> = {
        updatedAt: now
      }

      if (typeof updates.name !== 'undefined') {
        payload.name = updates.name
      }

      if (typeof updates.description !== 'undefined') {
        payload.description = updates.description ?? null
      }

      if (typeof updates.visibility !== 'undefined') {
        payload.visibility = updates.visibility
      }

      if (typeof updates.status !== 'undefined') {
        payload.status = updates.status
      }

      if (typeof updates.frameAssetId !== 'undefined') {
        payload.frameAssetId = updates.frameAssetId
      }

      if (typeof updates.aspectRatio !== 'undefined') {
        payload.aspectRatio = updates.aspectRatio
      }

      if (Object.prototype.hasOwnProperty.call(updates, 'thumbnailAssetId')) {
        payload.thumbnailAssetId = updates.thumbnailAssetId ?? null
      }

      if (typeof updates.slug !== 'undefined' && updates.slug !== current.slug) {
        payload.slug = updates.slug

        const historyRef = db.collection(Collections.SLUG_HISTORY).doc(this.generateId())
        tx.set(historyRef, {
          campaignId,
          slug: current.slug,
          createdAt: now
        } as FirestoreSlugHistoryDoc)
      }

      tx.update(campaignRef, payload)
    })

    return await this.getCampaignById(campaignId)
  },

  async updateCampaignStatus(campaignId: string, status: CampaignStatus) {
    return await this.updateCampaign(campaignId, { status })
  },

  async recordAuditLog(entry: {
    actorUserId?: string | null
    action: string
    targetType: string
    targetId: string
    metadata?: Record<string, any> | null
  }) {
    const db = getFirestore()
    const logId = this.generateId()
    const now = this.timestamp()

    await db.collection(Collections.AUDIT_LOGS).doc(logId).set({
      actorUserId: entry.actorUserId ?? null,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      metadata: entry.metadata ?? null,
      createdAt: now
    })
  },

  async getSlugHistory(slug: string) {
    const db = getFirestore()
    const snapshot = await db
      .collection(Collections.SLUG_HISTORY)
      .where('slug', '==', slug)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return null
    }

    const doc = snapshot.docs[0]
    const data = doc.data() as FirestoreSlugHistoryDoc
    return { id: doc.id, ...data }
  },

  async incrementCampaignMetric(campaignId: string, dateKey: string, metric: 'visit' | 'render' | 'download') {
    const db = getFirestore()
    const statsId = `${campaignId}_${dateKey}`
    const statsRef = db.collection(Collections.CAMPAIGN_STATS).doc(statsId)

    await db.runTransaction(async (tx) => {
      const snapshot = await tx.get(statsRef)
      const now = this.timestamp()

      if (!snapshot.exists) {
        tx.set(statsRef, {
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

      const updates: Record<string, any> = {
        updatedAt: now
      }

      if (metric === 'visit') {
        updates.visits = FieldValue.increment(1)
      }

      if (metric === 'render') {
        updates.renders = FieldValue.increment(1)
      }

      if (metric === 'download') {
        updates.downloads = FieldValue.increment(1)
      }

      tx.update(statsRef, updates)
    })
  },

  async getCampaignStatsSince(campaignId: string, fromDate: string) {
    const db = getFirestore()
    const snapshot = await db
      .collection(Collections.CAMPAIGN_STATS)
      .where('campaignId', '==', campaignId)
      .where('date', '>=', fromDate)
      .orderBy('date', 'asc')
      .get()

    const dailyStats = snapshot.docs.map((doc) => {
      const data = doc.data() as FirestoreStatsDoc
      return {
        date: data.date,
        visits: data.visits || 0,
        renders: data.renders || 0,
        downloads: data.downloads || 0
      }
    })

    const totals = dailyStats.reduce(
      (acc, stat) => {
        acc.visits += stat.visits
        acc.renders += stat.renders
        acc.downloads += stat.downloads
        return acc
      },
      createEmptyMetrics()
    )

    return { totals, dailyStats }
  }
}
