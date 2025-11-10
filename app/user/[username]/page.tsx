'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getUserByUsername, UserProfile } from '@/lib/auth'
import { getUserCampaigns, Campaign, getUserAggregateStats } from '@/lib/firestore'
import LoadingSpinner from '@/components/LoadingSpinner'

// Prevent static generation for this dynamic page
export const dynamic = 'force-dynamic'

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  
  const [user, setUser] = useState<UserProfile | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState({ visits: 0, downloads: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (username) {
      loadUserProfile()
    }
  }, [username]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserProfile = async () => {
    try {
      // Get user by username
      const userProfile = await getUserByUsername(username)
      
      if (!userProfile) {
        setError('User not found')
        setLoading(false)
        return
      }
      
      setUser(userProfile)
      
      // Get user's public campaigns
      const allCampaigns = await getUserCampaigns(userProfile.uid)
      const publicCampaigns = allCampaigns.filter(c => c.visibility === 'Public')
      setCampaigns(publicCampaigns)
      
      // Get aggregate stats
      const aggregateStats = await getUserAggregateStats(userProfile.uid)
      setStats(aggregateStats)
      
    } catch (error) {
      console.error('Error loading user profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner text="Loading profile..." />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Profile Not Found</h1>
          <p className="text-primary/60 mb-6">The user profile you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-secondary hover:bg-secondary/90 text-primary px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  const joinDate = user.joinedAt || user.createdAt
  const formattedJoinDate = joinDate 
    ? new Date(joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently'

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Profile Header */}
        <div className="bg-white border border-[#00240010] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
            {/* Avatar */}
            {user.avatarURL || user.photoURL ? (
              <img
                src={user.avatarURL || user.photoURL}
                alt={user.displayName || username}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover flex-shrink-0 border-2 border-[#00240010]"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 border-2 border-[#00240010]">
                <span className="text-primary font-bold text-3xl sm:text-4xl">
                  {(user.displayName || username).charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1">
                {user.displayName || username}
              </h1>
              <p className="text-primary/60 text-base sm:text-lg mb-2">@{username}</p>
              {user.bio && (
                <p className="text-primary/70 text-sm sm:text-base leading-relaxed mb-3">
                  {user.bio}
                </p>
              )}
              <p className="text-primary/50 text-xs sm:text-sm">
                Joined {formattedJoinDate}
              </p>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#00240010]">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                {campaigns.length}
              </div>
              <div className="text-xs sm:text-sm text-primary/60">
                Campaign{campaigns.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                {stats.downloads.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-primary/60">
                Download{stats.downloads !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                {stats.visits.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-primary/60">
                Visit{stats.visits !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-primary mb-6">
            Public Campaigns
          </h2>
          
          {campaigns.length === 0 ? (
            <div className="bg-white border border-[#00240010] rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-[#f2fff2] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-primary/60 mb-2">No public campaigns yet</h3>
              <p className="text-primary/50 text-sm">
                This creator hasn&apos;t published any campaigns yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/campaign/${campaign.slug}`}
                  className="group bg-white border border-[#00240010] rounded-2xl overflow-hidden hover:border-[#00240020] hover:shadow-md transition-all"
                >
                  {/* Campaign Image */}
                  <div className="aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={campaign.frameURL}
                      alt={campaign.campaignName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Campaign Info */}
                  <div className="p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-primary mb-1 truncate group-hover:text-secondary transition-colors">
                      {campaign.campaignName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-primary/60">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <span>{campaign.supportersCount || 0} supporters</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
