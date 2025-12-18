'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Campaign } from '@/lib/firestore'
import { getUserProfile, UserProfile } from '@/lib/auth'

interface PublicCampaignCardProps {
  campaign: Campaign
  onClick: (slug: string) => void
}

export default function PublicCampaignCard({ campaign, onClick }: PublicCampaignCardProps) {
  const [publisher, setPublisher] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPublisher = async () => {
      setLoading(true)
      if (campaign.createdBy) {
        const profile = await getUserProfile(campaign.createdBy)
        setPublisher(profile)
      }
      setLoading(false)
    }
    fetchPublisher()
  }, [campaign.createdBy])

  return (
    <div
      onClick={() => onClick(campaign.slug)}
      className="bg-white rounded-2xl border border-[#00240010] overflow-hidden hover:border-[#00240020] transition-all shadow-sm hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] animate-fade-in"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(campaign.slug)
        }
      }}
      aria-label={`View campaign: ${campaign.campaignName}`}
    >
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
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      
      {/* Info */}
      <div className="flex flex-col" style={{ padding: '1em' }}>
        {/* Top - Title */}
        <div className="mb-2">
          <h3 className="text-primary text-lg sm:text-lg font-semibold leading-tight truncate mb-1.5">
            {campaign.campaignName}
          </h3>
          
          {/* Publisher Info */}
          {!loading && (publisher || campaign.createdByEmail) && (
            <div className="flex items-center gap-2 text-primary/60 text-xs sm:text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="truncate">
                by {publisher?.displayName || 
                    (publisher?.email ? publisher.email.split('@')[0] : '') || 
                    (campaign.createdByEmail ? campaign.createdByEmail.split('@')[0] : '') || 
                    'Unknown'}
              </span>
            </div>
          )}
        </div>
        
        {/* Bottom - Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-[#00240010]">
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
