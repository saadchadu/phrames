import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/AuthProvider'

export interface DashboardNotification {
  id: string
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
  createdAt: string
  expiresAt?: string
}

interface NotificationsResponse {
  notifications: DashboardNotification[]
  count: number
  hasMore: boolean
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<DashboardNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get auth token
  const getAuthToken = useCallback(async () => {
    if (!user) return null
    try {
      return await user.getIdToken()
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
    }
  }, [user])

  // Fetch notifications
  const fetchNotifications = useCallback(async (unreadOnly = false, limit = 50) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const token = await getAuthToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      const params = new URLSearchParams({
        ...(unreadOnly && { unreadOnly: 'true' }),
        limit: limit.toString()
      })

      const response = await fetch(`/api/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data: NotificationsResponse = await response.json()
      setNotifications(data.notifications)
    } catch (error: any) {
      setError(error.message)
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [user, getAuthToken])

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return

    try {
      const token = await getAuthToken()
      if (!token) return

      const response = await fetch('/api/notifications/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }, [user, getAuthToken])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return false

    try {
      const token = await getAuthToken()
      if (!token) return false

      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationId,
          action: 'markAsRead'
        })
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        return true
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
    return false
  }, [user, getAuthToken])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return false

    try {
      const token = await getAuthToken()
      if (!token) return false

      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'markAsRead'
        })
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true }))
        )
        setUnreadCount(0)
        return true
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
    return false
  }, [user, getAuthToken])

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return false

    try {
      const token = await getAuthToken()
      if (!token) return false

      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationId })
      })

      if (response.ok) {
        // Update local state
        const notification = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
        return true
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
    return false
  }, [user, getAuthToken, notifications])

  // Auto-fetch on user change
  useEffect(() => {
    if (user) {
      fetchNotifications()
      fetchUnreadCount()
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user, fetchNotifications, fetchUnreadCount])

  // Refresh notifications periodically
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [user, fetchUnreadCount])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: () => {
      fetchNotifications()
      fetchUnreadCount()
    }
  }
}