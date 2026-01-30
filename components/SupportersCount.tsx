'use client'

import useCampaignStats from '@/hooks/useCampaignStats'

interface SupportersCountProps {
  campaignId: string | undefined
  fallbackCount: number
  className?: string
}

export default function SupportersCount({ campaignId, fallbackCount, className = '' }: SupportersCountProps) {
  const { stats: campaignStats } = useCampaignStats(campaignId)
  
  const count = campaignStats?.supportersCount ?? fallbackCount
  
  return (
    <span className={className}>
      {count} supporter{count !== 1 ? 's' : ''}
    </span>
  )
}

export function SupportersCountNumber({ campaignId, fallbackCount, className = '' }: SupportersCountProps) {
  const { stats: campaignStats } = useCampaignStats(campaignId)
  
  const count = campaignStats?.supportersCount ?? fallbackCount
  
  return (
    <span className={className}>
      {count}
    </span>
  )
}