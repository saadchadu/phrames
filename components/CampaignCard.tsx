'use client'

import Image from 'next/image'
import { Campaign } from '@/lib/firestore'
import { PencilIcon, LinkIcon, TrashIcon, QrCodeIcon } from '@heroicons/react/24/outline'
import { toast } from '@/components/ui/toaster'
import QRCode from 'qrcode'
import useCampaignStats from '@/hooks/useCampaignStats'
import ClientOnly from './ClientOnly'

interface CampaignCardProps {
  campaign: Campaign
  onEdit: (id: string) => void
  onShare: (slug: string) => void
  onDelete: (id: string) => void
  onReactivate?: (id: string) => void
}

// Helper function to format expiry countdown
function formatExpiryCountdown(expiresAt: any): string {
  if (!expiresAt) return ''
  
  const expiryDate = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt)
  const now = new Date()
  const diffMs = expiryDate.getTime() - now.getTime()
  
  if (diffMs <= 0) return 'Expired'
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} left`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} left`
  } else {
    return 'Expires soon'
  }
}

// Check if campaign is truly active
function isCampaignActive(campaign: Campaign): boolean {
  if (!campaign.isActive) return false
  
  // Check expiry for all campaigns (including free)
  if (!campaign.expiresAt) return campaign.isActive // Grandfathered campaigns
  
  const expiryDate = campaign.expiresAt.toDate ? campaign.expiresAt.toDate() : new Date(campaign.expiresAt)
  return expiryDate > new Date()
}

export default function CampaignCard({ campaign, onEdit, onShare, onDelete, onReactivate }: CampaignCardProps) {
  // Use real-time campaign stats
  const { stats: campaignStats } = useCampaignStats(campaign.id)
  const isActive = isCampaignActive(campaign)
  const isFree = campaign.isFreeCampaign === true
  const expiryText = campaign.expiresAt ? formatExpiryCountdown(campaign.expiresAt) : ''
  const handleCopyLink = async () => {
    const url = `${window.location.origin}/campaign/${campaign.slug}`
    
    try {
      await navigator.clipboard.writeText(url)
      toast('Link copied to clipboard!', 'success')
    } catch (error) {
      toast('Failed to copy link', 'error')
    }
  }

  const handleDownloadQR = async () => {
    try {
      const url = `${window.location.origin}/campaign/${campaign.slug}`
      
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      // Download the QR code
      const link = document.createElement('a')
      link.href = qrDataUrl
      link.download = `${campaign.slug}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast('QR code downloaded!', 'success')
    } catch (error) {
      toast('Failed to download QR code', 'error')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#00240010] overflow-hidden hover:border-[#00240020] transition-all shadow-sm hover:shadow-md">
      {/* Image */}
      <div className={`relative w-full overflow-hidden bg-gray-50 ${
        campaign.aspectRatio === '4:5' ? 'aspect-[4/5]' : 
        campaign.aspectRatio === '3:4' ? 'aspect-[3/4]' : 
        'aspect-square'
      }`}>
        <Image
          src={campaign.frameURL}
          alt={campaign.campaignName}
          fill
          className="object-cover"
        />
        {/* Action buttons overlay */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-2">
          <button
            onClick={() => onEdit(campaign.id!)}
            className="bg-white/95 hover:bg-white active:scale-95 backdrop-blur-sm border border-[#00240020] hover:border-[#00240040] p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all shadow-sm"
            aria-label="Edit campaign"
          >
            <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </button>
          <button
            onClick={handleDownloadQR}
            className="bg-white/95 hover:bg-white active:scale-95 backdrop-blur-sm border border-[#00240020] hover:border-[#00240040] p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all shadow-sm"
            aria-label="Download QR code"
          >
            <QrCodeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </button>
          <button
            onClick={handleCopyLink}
            className="bg-white/95 hover:bg-white active:scale-95 backdrop-blur-sm border border-[#00240020] hover:border-[#00240040] p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all shadow-sm"
            aria-label="Copy link"
          >
            <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </button>
          <button
            onClick={() => onDelete(campaign.id!)}
            className="bg-white/95 hover:bg-red-50 active:scale-95 backdrop-blur-sm border border-[#00240020] hover:border-red-300 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all shadow-sm"
            aria-label="Delete campaign"
          >
            <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
          </button>
        </div>
      </div>
      
      {/* Info */}
      <div className="flex flex-col p-4 sm:p-6">
        {/* Top - Title & Description */}
        <div className="mb-3 sm:mb-4">
          <h3 className="text-primary text-lg sm:text-xl font-semibold leading-tight truncate mb-1.5 sm:mb-2">
            {campaign.campaignName}
          </h3>
          
          {campaign.description && (
            <p className="text-primary/60 text-sm leading-relaxed line-clamp-2">
              {campaign.description}
            </p>
          )}
        </div>
        
        {/* Bottom - Stats and Status */}
        <div className="flex flex-col gap-3 pt-3 sm:pt-4 border-t border-[#00240010]">
          {/* Status Badge and Expiry */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isFree && isActive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Free Campaign
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isActive 
                    ? 'bg-secondary/10 text-secondary' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-secondary' : 'bg-gray-400'
                  }`} />
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>
            
            {isActive && expiryText && (
              <span className="text-xs text-primary/60 font-medium">
                {expiryText}
              </span>
            )}
          </div>

          {/* Supporters Count */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <svg className="w-4 h-4 text-primary/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span className="text-primary/60 text-xs sm:text-sm font-medium leading-tight">
              <ClientOnly fallback={<span>{campaign.supportersCount} supporter{campaign.supportersCount !== 1 ? 's' : ''}</span>}>
                {campaignStats?.supportersCount ?? campaign.supportersCount} supporter{(campaignStats?.supportersCount ?? campaign.supportersCount) !== 1 ? 's' : ''}
              </ClientOnly>
            </span>
          </div>

          {/* Order ID for Paid Campaigns */}
          {!isFree && campaign.paymentId && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg className="w-4 h-4 text-primary/60 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-primary/60 text-xs sm:text-sm font-medium leading-tight">
                Order: {campaign.paymentId}
              </span>
            </div>
          )}

          {/* Reactivate Button for Inactive Paid Campaigns Only */}
          {!isActive && !isFree && onReactivate && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onReactivate(campaign.id!)
              }}
              className="w-full mt-2 px-4 py-2 bg-secondary hover:bg-secondary/90 text-primary text-sm font-semibold rounded-lg transition-all"
            >
              Reactivate Campaign
            </button>
          )}
        </div>
      </div>
    </div>
  )
}