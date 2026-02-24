'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import AuthGuard from '@/components/AuthGuard'
import CampaignCard from '@/components/CampaignCard'
import PaymentModal from '@/components/PaymentModal'
import { getUserCampaigns, deleteCampaign, checkFreeCampaignEligibility, Campaign } from '@/lib/firestore'
import { useDialog } from '@/hooks/useDialog'
import AlertDialog from '@/components/ui/AlertDialog'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

// Prevent static generation for this auth-protected page
export const dynamic = 'force-dynamic'
import { toast } from '@/components/ui/toaster'
import {
  PlusIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { CreditCard } from 'lucide-react'
import SupportHub from '@/components/SupportHub'

function DashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [reactivatingCampaign, setReactivatingCampaign] = useState<Campaign | null>(null)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [hasFreeCampaign, setHasFreeCampaign] = useState<boolean | null>(null)
  const { alertState, showAlert, closeAlert, confirmState, showConfirm, closeConfirm } = useDialog()

  useEffect(() => {
    if (user) {
      loadCampaigns()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Check for payment success
    const paymentStatus = searchParams.get('payment')
    const freeCampaign = searchParams.get('freeCampaign')

    if (paymentStatus === 'success') {
      toast('Campaign activated successfully!', 'success')
      // Reload campaigns to show updated status
      if (user) {
        loadCampaigns(true)
      }
    } else if (freeCampaign === 'true') {
      toast('🎉 Your first campaign is FREE for 1 month!', 'success')
      // Reload campaigns to show the new free campaign
      if (user) {
        loadCampaigns(true)
      }
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCampaigns = async (isRefresh = false) => {
    if (!user) {
      return
    }

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    try {
      const [userCampaigns, isEligible] = await Promise.all([
        getUserCampaigns(user.uid),
        checkFreeCampaignEligibility(user.uid)
      ])

      setCampaigns(userCampaigns)
      setHasFreeCampaign(isEligible)

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
    const confirmed = await showConfirm({
      title: 'Delete Campaign',
      message: 'Are you sure you want to delete this campaign? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    })

    if (!confirmed) {
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

  const handleReactivate = (id: string) => {
    const campaign = campaigns.find(c => c.id === id)
    if (campaign) {
      setReactivatingCampaign(campaign)
      setShowPaymentModal(true)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setReactivatingCampaign(null)
    toast('Campaign reactivated successfully!', 'success')
    loadCampaigns(true)
  }

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false)
    setReactivatingCampaign(null)
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
      {/* Support Hub */}
      <SupportHub
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        userEmail={user?.email || ''}
        userName={user?.displayName || ''}
      />

      {/* Payment Modal for Reactivation */}
      {reactivatingCampaign && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentModalClose}
          campaignId={reactivatingCampaign.id!}
          campaignName={reactivatingCampaign.campaignName}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-white to-[#f2fff233]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] font-bold text-primary leading-tight">
                  My Campaigns
                </h1>
                {hasFreeCampaign !== null && (
                  <span className={`inline-flex items-center w-fit px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${hasFreeCampaign
                    ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-100 text-gray-500 border border-gray-200/60'
                    }`}>
                    {hasFreeCampaign ? '1 Free Campaign Available' : 'Free Campaign Used'}
                  </span>
                )}
              </div>
              <p className="text-primary/70 text-sm sm:text-base font-normal leading-normal">
                Manage your frame campaigns and track their performance
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:scale-95 text-primary border border-[#00240020] px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-medium transition-all shadow-sm"
              >
                <UserCircleIcon className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <Link
                href="/dashboard/payments"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:scale-95 text-primary border border-[#00240020] px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-medium transition-all shadow-sm"
              >
                <CreditCard className="h-5 w-5" />
                <span>Payments</span>
              </Link>
              <button
                onClick={() => setShowSupportModal(true)}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:scale-95 text-primary border border-[#00240020] px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-medium transition-all shadow-sm"
                aria-label="Support"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>Support</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:scale-95 text-primary border border-[#00240020] px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-medium transition-all disabled:opacity-50 shadow-sm"
                aria-label="Refresh campaigns"
              >
                <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <Link
                href="/create"
                className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 active:scale-95 text-primary px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold transition-all shadow-sm"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Create Campaign</span>
              </Link>
            </div>
          </div>

          {/* Campaigns Grid */}
          {campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-4 sm:gap-6 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f2fff2] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-primary/60 text-xl sm:text-2xl font-bold leading-tight text-center">
                  No campaigns yet
                </h3>
                <p className="text-primary/50 text-sm sm:text-base font-normal leading-normal text-center max-w-md px-4">
                  Create your first frame campaign to get started
                </p>
              </div>
              <Link
                href="/create"
                className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 active:scale-95 text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all shadow-sm"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Create Your First Campaign</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
                    onReactivate={handleReactivate}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AlertDialog
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
      />
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm || (() => {})}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
      />
    </AuthGuard>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}