'use client'

import { Campaign } from '@/lib/firestore'
import PublicCampaignCard from './PublicCampaignCard'
import LoadingSpinner from './LoadingSpinner'

interface SearchResultsProps {
  campaigns: Campaign[]
  loading: boolean
  searchQuery: string
  onCampaignClick: (slug: string) => void
}

export default function SearchResults({ 
  campaigns, 
  loading, 
  searchQuery,
  onCampaignClick 
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12" aria-label="Loading campaigns">
        <LoadingSpinner />
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/80 text-lg">
          {searchQuery 
            ? 'No campaigns found. Try a different search term.' 
            : 'No public campaigns available yet.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
      {campaigns.map((campaign) => (
        <PublicCampaignCard
          key={campaign.id}
          campaign={campaign}
          onClick={onCampaignClick}
        />
      ))}
    </div>
  )
}
