'use client'

import Image from 'next/image'
import { Campaign } from '@/lib/firestore'
import { PencilIcon, ShareIcon, TrashIcon } from '@heroicons/react/24/outline'

interface CampaignCardProps {
  campaign: Campaign
  onEdit: (id: string) => void
  onShare: (slug: string) => void
  onDelete: (id: string) => void
}

export default function CampaignCard({ campaign, onEdit, onShare, onDelete }: CampaignCardProps) {
  const handleShare = async () => {
    const url = `${window.location.origin}/c/${campaign.slug}`
    
    try {
      await navigator.clipboard.writeText(url)
      onShare(campaign.slug)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      // Fallback: show the URL in an alert
      alert(`Campaign URL: ${url}`)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="aspect-square relative">
        <Image
          src={campaign.frameURL}
          alt={campaign.campaignName}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {campaign.campaignName}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            campaign.status === 'Active' 
              ? 'bg-secondary/20 text-primary' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {campaign.status}
          </span>
        </div>
        
        {campaign.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {campaign.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            {campaign.supportersCount} supporters
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            campaign.visibility === 'Public' 
              ? 'bg-secondary/20 text-primary' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {campaign.visibility}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(campaign.id!)}
            className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </button>
          
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-secondary text-primary rounded-md text-sm font-medium hover:bg-secondary/90 transition-colors"
          >
            <ShareIcon className="h-4 w-4 mr-1" />
            Share
          </button>
          
          <button
            onClick={() => onDelete(campaign.id!)}
            className="flex items-center justify-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}