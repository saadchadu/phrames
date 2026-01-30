'use client'

import { Campaign } from '@/lib/firestore'

interface TrendingBadgeProps {
  campaign: Campaign
  showWeeklyDownloads?: boolean
  className?: string
}

export default function TrendingBadge({ 
  campaign, 
  showWeeklyDownloads = false, 
  className = '' 
}: TrendingBadgeProps) {
  const weeklyDownloads = campaign.weeklyDownloads || 0
  const trendingScore = campaign.trendingScore || 0
  
  // Show trending badge if campaign has significant activity
  const isTrending = trendingScore > 10 || weeklyDownloads > 5
  
  if (!isTrending && !showWeeklyDownloads) {
    return null
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isTrending && (
        <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
          <span>Trending</span>
        </div>
      )}
      
      {showWeeklyDownloads && weeklyDownloads > 0 && (
        <div className="flex items-center gap-1 bg-blue-500/20 border border-blue-500/30 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          <span>{weeklyDownloads} this week</span>
        </div>
      )}
    </div>
  )
}