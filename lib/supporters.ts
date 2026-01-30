/**
 * Supporters Management System
 * Handles supporter tracking with deduplication, audit trails, and data integrity
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  increment,
  runTransaction,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'

export interface SupporterRecord {
  id?: string
  campaignId: string
  userId?: string // null for anonymous supporters
  userEmail?: string
  sessionId: string // Browser session ID for deduplication
  ipAddress?: string // For additional deduplication
  userAgent?: string
  supportedAt: any
  downloadCount: number // Track multiple downloads by same supporter
  lastDownloadAt: any
}

export interface SupporterStats {
  totalSupporters: number
  totalDownloads: number
  uniqueSupporters: number
  anonymousSupporters: number
  registeredSupporters: number
}

// Generate a session ID for anonymous users
export const getSessionId = (): string => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.sessionStorage) {
    let sessionId = window.sessionStorage.getItem('phrames_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      window.sessionStorage.setItem('phrames_session_id', sessionId)
    }
    return sessionId
  }
  
  // For server-side or when sessionStorage is not available, generate a random ID
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

// Check if user/session has already supported this campaign
export const hasUserSupported = async (campaignId: string, userId?: string, sessionId?: string): Promise<boolean> => {
  try {
    const supportersRef = collection(db, 'supporters')
    
    // Check by user ID first (for logged-in users)
    if (userId) {
      const userQuery = query(
        supportersRef,
        where('campaignId', '==', campaignId),
        where('userId', '==', userId)
      )
      const userSnapshot = await getDocs(userQuery)
      if (!userSnapshot.empty) {
        return true
      }
    }
    
    // Check by session ID (for anonymous users or as fallback)
    if (sessionId) {
      const sessionQuery = query(
        supportersRef,
        where('campaignId', '==', campaignId),
        where('sessionId', '==', sessionId)
      )
      const sessionSnapshot = await getDocs(sessionQuery)
      if (!sessionSnapshot.empty) {
        return true
      }
    }
    
    return false
  } catch (error) {
    console.error('Error checking supporter status:', error)
    return false // Assume not supported on error to allow support
  }
}

// Add supporter with deduplication and atomic updates
export const addSupporter = async (
  campaignId: string, 
  userId?: string, 
  userEmail?: string,
  sessionId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; error?: string; isNewSupporter?: boolean }> => {
  try {
    const finalSessionId = sessionId || getSessionId()
    
    // Check if already supported
    const alreadySupported = await hasUserSupported(campaignId, userId, finalSessionId)
    
    if (alreadySupported) {
      // Update existing supporter record (increment download count)
      const supportersRef = collection(db, 'supporters')
      let existingQuery
      
      if (userId) {
        existingQuery = query(
          supportersRef,
          where('campaignId', '==', campaignId),
          where('userId', '==', userId)
        )
      } else {
        existingQuery = query(
          supportersRef,
          where('campaignId', '==', campaignId),
          where('sessionId', '==', finalSessionId)
        )
      }
      
      const existingSnapshot = await getDocs(existingQuery)
      if (!existingSnapshot.empty) {
        const existingDoc = existingSnapshot.docs[0]
        await updateDoc(existingDoc.ref, {
          downloadCount: increment(1),
          lastDownloadAt: serverTimestamp()
        })
        
        return { success: true, isNewSupporter: false }
      }
    }
    
    // Use transaction to ensure atomicity
    const result = await runTransaction(db, async (transaction) => {
      // Get campaign document
      const campaignRef = doc(db, 'campaigns', campaignId)
      const campaignDoc = await transaction.get(campaignRef)
      
      if (!campaignDoc.exists()) {
        throw new Error('Campaign not found')
      }
      
      const campaignData = campaignDoc.data()
      
      // Check if campaign is active
      if (!campaignData.isActive || campaignData.status !== 'Active') {
        throw new Error('Campaign is not active')
      }
      
      // Create supporter record
      const supporterRef = doc(collection(db, 'supporters'))
      transaction.set(supporterRef, {
        campaignId,
        userId: userId || null,
        userEmail: userEmail || null,
        sessionId: finalSessionId,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        supportedAt: serverTimestamp(),
        downloadCount: 1,
        lastDownloadAt: serverTimestamp()
      })
      
      // Increment campaign supporters count
      transaction.update(campaignRef, {
        supportersCount: increment(1)
      })
      
      return { success: true, isNewSupporter: true }
    })
    
    return result
  } catch (error: any) {
    console.error('Error adding supporter:', error)
    return { success: false, error: error.message }
  }
}

// Get supporter statistics for a campaign
export const getCampaignSupporterStats = async (campaignId: string): Promise<SupporterStats> => {
  try {
    const supportersRef = collection(db, 'supporters')
    const q = query(supportersRef, where('campaignId', '==', campaignId))
    const snapshot = await getDocs(q)
    
    let totalDownloads = 0
    let registeredSupporters = 0
    let anonymousSupporters = 0
    
    snapshot.forEach((doc) => {
      const data = doc.data() as SupporterRecord
      totalDownloads += data.downloadCount || 1
      
      if (data.userId) {
        registeredSupporters++
      } else {
        anonymousSupporters++
      }
    })
    
    return {
      totalSupporters: snapshot.size,
      totalDownloads,
      uniqueSupporters: snapshot.size,
      anonymousSupporters,
      registeredSupporters
    }
  } catch (error) {
    console.error('Error getting supporter stats:', error)
    return {
      totalSupporters: 0,
      totalDownloads: 0,
      uniqueSupporters: 0,
      anonymousSupporters: 0,
      registeredSupporters: 0
    }
  }
}

// Recalculate and fix supporter count for a campaign
export const recalculateSupportersCount = async (campaignId: string): Promise<{ success: boolean; error?: string; oldCount?: number; newCount?: number }> => {
  try {
    return await runTransaction(db, async (transaction) => {
      // Get current campaign data
      const campaignRef = doc(db, 'campaigns', campaignId)
      const campaignDoc = await transaction.get(campaignRef)
      
      if (!campaignDoc.exists()) {
        throw new Error('Campaign not found')
      }
      
      const campaignData = campaignDoc.data()
      const oldCount = campaignData.supportersCount || 0
      
      // Count actual supporters
      const supportersRef = collection(db, 'supporters')
      const q = query(supportersRef, where('campaignId', '==', campaignId))
      const snapshot = await getDocs(q)
      const actualCount = snapshot.size
      
      // Update campaign with correct count
      transaction.update(campaignRef, {
        supportersCount: actualCount
      })
      
      return { success: true, oldCount, newCount: actualCount }
    })
  } catch (error: any) {
    console.error('Error recalculating supporters count:', error)
    return { success: false, error: error.message }
  }
}

// Get supporters list for a campaign (for campaign owners)
export const getCampaignSupporters = async (campaignId: string, limit: number = 50): Promise<SupporterRecord[]> => {
  try {
    const supportersRef = collection(db, 'supporters')
    const q = query(
      supportersRef,
      where('campaignId', '==', campaignId),
      orderBy('supportedAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    const supporters: SupporterRecord[] = []
    
    snapshot.forEach((doc) => {
      supporters.push({ id: doc.id, ...doc.data() } as SupporterRecord)
    })
    
    return supporters.slice(0, limit)
  } catch (error) {
    console.error('Error getting campaign supporters:', error)
    return []
  }
}

// Bulk fix all campaigns' supporter counts
export const fixAllCampaignsSupportersCount = async (): Promise<{ success: boolean; fixed: number; errors: string[] }> => {
  try {
    const campaignsRef = collection(db, 'campaigns')
    const campaignsSnapshot = await getDocs(campaignsRef)
    
    let fixed = 0
    const errors: string[] = []
    
    // Process in batches to avoid overwhelming Firestore
    const batch = writeBatch(db)
    let batchCount = 0
    
    for (const campaignDoc of campaignsSnapshot.docs) {
      try {
        const campaignId = campaignDoc.id
        const campaignData = campaignDoc.data()
        
        // Count actual supporters
        const supportersRef = collection(db, 'supporters')
        const q = query(supportersRef, where('campaignId', '==', campaignId))
        const supportersSnapshot = await getDocs(q)
        const actualCount = supportersSnapshot.size
        const currentCount = campaignData.supportersCount || 0
        
        // Only update if counts don't match
        if (actualCount !== currentCount) {
          batch.update(campaignDoc.ref, { supportersCount: actualCount })
          batchCount++
          fixed++
          
          console.log(`Fixed campaign ${campaignId}: ${currentCount} -> ${actualCount}`)
        }
        
        // Commit batch every 500 operations (Firestore limit)
        if (batchCount >= 500) {
          await batch.commit()
          batchCount = 0
        }
        
      } catch (error: any) {
        errors.push(`Campaign ${campaignDoc.id}: ${error.message}`)
      }
    }
    
    // Commit remaining operations
    if (batchCount > 0) {
      await batch.commit()
    }
    
    return { success: true, fixed, errors }
  } catch (error: any) {
    console.error('Error fixing all campaigns supporters count:', error)
    return { success: false, fixed: 0, errors: [error.message] }
  }
}

// Clean up orphaned supporter records (campaigns that no longer exist)
export const cleanupOrphanedSupporters = async (): Promise<{ success: boolean; cleaned: number; errors: string[] }> => {
  try {
    const supportersRef = collection(db, 'supporters')
    const supportersSnapshot = await getDocs(supportersRef)
    
    let cleaned = 0
    const errors: string[] = []
    const batch = writeBatch(db)
    let batchCount = 0
    
    for (const supporterDoc of supportersSnapshot.docs) {
      try {
        const supporterData = supporterDoc.data() as SupporterRecord
        const campaignId = supporterData.campaignId
        
        // Check if campaign still exists
        const campaignRef = doc(db, 'campaigns', campaignId)
        const campaignDoc = await getDoc(campaignRef)
        
        if (!campaignDoc.exists()) {
          // Campaign doesn't exist, delete supporter record
          batch.delete(supporterDoc.ref)
          batchCount++
          cleaned++
          
          console.log(`Cleaned orphaned supporter record for campaign ${campaignId}`)
        }
        
        // Commit batch every 500 operations
        if (batchCount >= 500) {
          await batch.commit()
          batchCount = 0
        }
        
      } catch (error: any) {
        errors.push(`Supporter ${supporterDoc.id}: ${error.message}`)
      }
    }
    
    // Commit remaining operations
    if (batchCount > 0) {
      await batch.commit()
    }
    
    return { success: true, cleaned, errors }
  } catch (error: any) {
    console.error('Error cleaning orphaned supporters:', error)
    return { success: false, cleaned: 0, errors: [error.message] }
  }
}