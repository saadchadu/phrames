'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import AuthGuard from '@/components/AuthGuard'
import CampaignCard from '@/components/CampaignCard'
import { getUserCampaigns, deleteCampaign, Campaign } from '@/lib/firestore'

// Prevent static generation for this auth-protected page
export const dynamic = 'force-dynamic'
import { toast } from '@/components/ui/toaster'
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadCampaigns()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCampaigns = async (isRefresh = false) => {
    if (!user) {
      console.log('No user found, skipping campaign load')
      return
    }
    
    console.log('Loading campaigns for user:', user.uid)
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    try {
      const userCampaigns = await getUserCampaigns(user.uid)
      console.log('Loaded campaigns:', userCampaigns)
      setCampaigns(userCampaigns)
      if (isRefresh) {
        toast('Campaigns refreshed', 'success')
      }
    } catch (error) {
      console.error('Error loading campaigns:', error)
      if (isRefresh) {
        toast('Error refreshing campaigns', 'error')
      }
    } finally {
      if (isRefresh) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  const handleRefresh = () => {
    loadCampaigns(true)
  }

  const handleEdit = (id: string) => {
    router.push(`/dashboard/campaigns/${id}/edit`)
  }

  const handleShare = (slug: string) => {
    // This is now handled directly in CampaignCard with copy to clipboard
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return
    }

    setDeleting(id)
    try {
      const { error } = await deleteCampaign(id)
      if (error) {
        toast('Error deleting campaign: ' + error, 'error')
      } else {
        setCampaigns(campaigns.filter(c => c.id !== id))
        toast('Campaign deleted successfully', 'success')
      }
    } catch (error) {
      console.error('Error deleting campaign:', error)
      toast('Error deleting campaign', 'error')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-secondary"></div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-white to-[#f2fff233]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
            <div className="flex flex-col gap-2">
              <h1 className="text-[38px] font-bold text-primary leading-tight">
                My Campaigns
              </h1>
              <p className="text-primary/70 text-[16px] font-normal leading-normal">
                Manage your frame campaigns and track their performance
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-primary border border-[#00240020] px-6 py-3 rounded-md text-[16px] font-medium transition-all whitespace-nowrap disabled:opacity-50"
                aria-label="Refresh campaigns"
              >
                <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <Link
                href="/create"
                className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-primary px-6 py-3 rounded-md text-[16px] font-medium transition-all whitespace-nowrap"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Create Campaign</span>
              </Link>
            </div>
          </div>

          {/* Campaigns Grid */}
          {campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <div className="w-20 h-20 bg-[#f2fff2] rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-primary/60 text-[24px] font-bold leading-tight text-center">
                  No campaigns yet
                </h3>
                <p className="text-primary/50 text-[14px] font-normal leading-normal text-center max-w-md">
                  Create your first frame campaign to get started
                </p>
              </div>
              <Link
                href="/create"
                className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-primary px-6 py-3 rounded-md text-[16px] font-medium transition-all"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Create Your First Campaign</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="relative group">
                  {deleting === campaign.id && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
                    </div>
                  )}
                  <CampaignCard
                    campaign={campaign}
                    onEdit={handleEdit}
                    onShare={handleShare}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}