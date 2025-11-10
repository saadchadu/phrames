'use client'

import Image from 'next/image'
import { Campaign } from '@/lib/firestore'
import { PencilIcon, LinkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { toast } from '@/components/ui/toaster'

interface CampaignCardProps {
  campaign: Campaign
  onEdit: (id: string) => void
  onShare: (slug: string) => void
  onDelete: (id: string) => void
}

export default function CampaignCard({ campaign, onEdit, onShare, onDelete }: CampaignCardProps) {
  const handleCopyLink = async () => {
    const url = `${window.location.origin}/campaign/${campaign.slug}`
    
    try {
      await navigator.clipboard.writeText(url)
      toast('Link copied to clipboard!', 'success')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast('Failed to copy link', 'error')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#00240010] overflow-hidden hover:border-[#00240020] transition-all shadow-sm hover:shadow-md">
      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
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
        
        {/* Bottom - Stats */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[#00240010]">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <svg className="w-4 h-4 text-primary/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span className="text-primary/60 text-xs sm:text-sm font-medium leading-tight">
              {campaign.supportersCount}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 ${
              campaign.status === 'Active' ? 'bg-secondary' : 'bg-gray-400'
            }`} />
            <span className="text-primary/60 text-xs sm:text-sm font-medium leading-tight">
              {campaign.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}