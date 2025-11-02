'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import AuthGuard from '@/components/AuthGuard'
import CampaignCard from '@/components/CampaignCard'
import ShareModal from '@/components/ShareModal'
import { getUserCampaigns, deleteCampaign, Campaign } from '@/lib/firestore'
import { toast } from '@/components/ui/toaster'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; campaign: Campaign | null }>({
    isOpen: false,
    campaign: null
  })

  useEffect(() => {
    if (user) {
      loadCampaigns()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCampaigns = async () => {
    if (!user) {
      console.log('No user found, skipping campaign load')
      return
    }
    
    console.log('Loading campaigns for user:', user.uid)
    setLoading(true)
    try {
      const userCampaigns = await getUserCampaigns(user.uid)
      console.log('Loaded campaigns:', userCampaigns)
      setCampaigns(userCampaigns)
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/dashboard/campaigns/${id}/edit`)
  }

  const handleShare = (slug: string) => {
    const campaign = campaigns.find(c => c.slug === slug)
    if (campaign) {
      setShareModal({ isOpen: true, campaign })
    }
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Campaigns</h1>
              <p className="text-gray-600 mt-1">
                Manage your frame campaigns and track their performance
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={loadCampaigns}
                disabled={loading}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <Link
                href="/create"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Create Campaign</span>
              </Link>
            </div>
          </div>

          {/* Campaigns Grid */}
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first frame campaign to get started
              </p>
              <Link
                href="/create"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center space-x-2 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Create Your First Campaign</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="relative">
                  {deleting === campaign.id && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
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

        {/* Share Modal */}
        <ShareModal
          isOpen={shareModal.isOpen}
          onClose={() => setShareModal({ isOpen: false, campaign: null })}
          campaignName={shareModal.campaign?.campaignName || ''}
          campaignUrl={shareModal.campaign ? `${window.location.origin}/c/${shareModal.campaign.slug}` : ''}
        />
      </div>
    </AuthGuard>
  )
}