import { useState, useEffect, useCallback } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface CampaignStats {
  supportersCount: number
  lastUpdated: Date
}

export function useCampaignStats(campaignId: string | undefined | null) {
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !campaignId) {
      setStats(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Set up real-time listener for campaign document
    const campaignRef = doc(db, 'campaigns', campaignId)
    
    const unsubscribe = onSnapshot(
      campaignRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          const supportersCount = data.supportersCount || 0
          setStats({
            supportersCount,
            lastUpdated: new Date()
          })
        } else {
          setError('Campaign not found')
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error listening to campaign stats:', error)
        setError('Failed to load campaign stats')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [campaignId, mounted])

  const refreshStats = useCallback(async () => {
    if (!campaignId) return

    try {
      // Force refresh by re-subscribing
      setLoading(true)
      // The onSnapshot listener will automatically update the stats
    } catch (error) {
      console.error('Error refreshing stats:', error)
      setError('Failed to refresh stats')
    }
  }, [campaignId])

  return {
    stats,
    loading,
    error,
    refreshStats
  }
}

export default useCampaignStats