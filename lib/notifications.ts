import { 
  collection, 
  doc,
  addDoc, 
  updateDoc,
  deleteDoc,
  getDocs,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'

export interface DashboardNotification {
  id?: string
  userId: string
  type: 'campaign_deletion_warning' | 'campaign_deleted' | 'campaign_expiry' | 'payment_success' | 'general'
  title: string
  message: string
  campaignId?: string
  campaignName?: string
  daysUntilAction?: number
  actionUrl?: string
  actionText?: string
  isRead: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: any
  expiresAt?: any // Auto-delete notification after this date
}

/**
 * Create a new dashboard notification
 */
export const createNotification = async (
  notification: Omit<DashboardNotification, 'id' | 'createdAt' | 'isRead'>
): Promise<string | null> => {
  try {
    const notificationData = {
      ...notification,
      isRead: false,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, 'notifications'), notificationData)
    return docRef.id
  } catch (error: any) {
    return null
  }
}

/**
 * Get all notifications for a user
 */
export const getUserNotifications = async (userId: string): Promise<DashboardNotification[]> => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const notifications: DashboardNotification[] = []
    
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      } as DashboardNotification)
    })
    
    return notifications
  } catch (error) {
    return []
  }
}

/**
 * Get unread notifications count for a user
 */
export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.size
  } catch (error) {
    return 0
  }
}

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId)
    await updateDoc(notificationRef, {
      isRead: true
    })
    return true
  } catch (error) {
    return false
  }
}

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    )
    
    const querySnapshot = await getDocs(q)
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { isRead: true })
    )
    
    await Promise.all(updatePromises)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId))
    return true
  } catch (error) {
    return false
  }
}

/**
 * Create campaign deletion warning notification
 */
export const createCampaignDeletionWarning = async (
  userId: string,
  campaignId: string,
  campaignName: string,
  daysUntilDeletion: number
): Promise<string | null> => {
  const priority = daysUntilDeletion <= 1 ? 'urgent' : daysUntilDeletion <= 3 ? 'high' : 'medium'
  
  return createNotification({
    userId,
    type: 'campaign_deletion_warning',
    title: `Campaign "${campaignName}" will be deleted soon`,
    message: `Your campaign will be automatically deleted in ${daysUntilDeletion} day${daysUntilDeletion === 1 ? '' : 's'} due to inactivity. Visit your campaign to keep it active.`,
    campaignId,
    campaignName,
    daysUntilAction: daysUntilDeletion,
    actionUrl: `/campaign/${campaignId}`,
    actionText: 'View Campaign',
    priority,
    expiresAt: Timestamp.fromDate(new Date(Date.now() + (daysUntilDeletion + 1) * 24 * 60 * 60 * 1000)) // Expire 1 day after deletion
  })
}

/**
 * Create campaign deleted notification
 */
export const createCampaignDeletedNotification = async (
  userId: string,
  campaignName: string,
  reason: string = 'inactivity'
): Promise<string | null> => {
  return createNotification({
    userId,
    type: 'campaign_deleted',
    title: `Campaign "${campaignName}" has been deleted`,
    message: `Your campaign was automatically deleted due to ${reason}. You can create a new campaign anytime.`,
    campaignName,
    actionUrl: '/create',
    actionText: 'Create New Campaign',
    priority: 'medium',
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // Expire after 30 days
  })
}

/**
 * Create campaign expiry notification
 */
export const createCampaignExpiryNotification = async (
  userId: string,
  campaignId: string,
  campaignName: string,
  daysUntilExpiry: number
): Promise<string | null> => {
  const priority = daysUntilExpiry <= 1 ? 'urgent' : daysUntilExpiry <= 3 ? 'high' : 'medium'
  
  return createNotification({
    userId,
    type: 'campaign_expiry',
    title: `Campaign "${campaignName}" expires soon`,
    message: `Your paid campaign will expire in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}. Extend your subscription to keep it active.`,
    campaignId,
    campaignName,
    daysUntilAction: daysUntilExpiry,
    actionUrl: `/campaign/${campaignId}`,
    actionText: 'Extend Campaign',
    priority,
    expiresAt: Timestamp.fromDate(new Date(Date.now() + (daysUntilExpiry + 7) * 24 * 60 * 60 * 1000)) // Expire 7 days after expiry
  })
}

/**
 * Remove existing deletion warnings for a campaign (when campaign becomes active)
 */
export const removeCampaignDeletionWarnings = async (
  userId: string,
  campaignId: string
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('campaignId', '==', campaignId),
      where('type', '==', 'campaign_deletion_warning')
    )
    
    const querySnapshot = await getDocs(q)
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
    
    await Promise.all(deletePromises)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Clean up expired notifications
 */
export const cleanupExpiredNotifications = async (): Promise<number> => {
  try {
    const now = Timestamp.now()
    const q = query(
      collection(db, 'notifications'),
      where('expiresAt', '<=', now)
    )
    
    const querySnapshot = await getDocs(q)
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
    
    await Promise.all(deletePromises)
    return querySnapshot.size
  } catch (error) {
    return 0
  }
}