'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Campaign } from '@/lib/firestore'
import { 
  MapPinIcon, 
  GlobeAltIcon,
  CheckBadgeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner'
import Avatar from '@/components/Avatar'

export const dynamic = 'force-dynamic'

interface UserProfile {
  uid: string
  username: string
  displayName?: string
  bio?: string
  profileImageUrl?: string
  googlePhotoURL?: string
  location?: string
  website?: string
  isVerified?: boolean
  createdAt?: any
}

interface CreatorStats {
  totalCampaigns: number
  activeCampaigns: number
  totalDownloads: number
  totalVisits: number
  memberSince: string
}

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<CreatorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (username) {
      loadProfile()
    }
  }, [username])

  const loadProfile = async () => {
    try {
      // Find user by username
      const usersRef = collection(db, 'users')
      const userQuery = query(usersRef, where('username', '==', username.toLowerCase()))
      const userSnapshot = await getDocs(userQuery)

      if (userSnapshot.empty) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const userData = { uid: userSnapshot.docs[0].id, ...userSnapshot.docs[0].data() } as UserProfile
      setProfile(userData)

      // Load public campaigns
      const campaignsRef = collection(db, 'campaigns')
      const now = new Date()
      
      const campaignsQuery = query(
        campaignsRef,
        where('createdBy', '==', userData.uid),
        where('visibility', '==', 'Public'),
        where('isActive', '==', true),
        where('status', '==', 'Active')
      )

      const campaignsSnapshot = await getDocs(campaignsQuery)
      const campaignsData = campaignsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Campaign))
        .filter(campaign => {
          // Filter out expired campaigns
          if (campaign.expiresAt) {
            return campaign.expiresAt.toDate() > now
          }
          return true
        })
        .sort((a, b) => {
          // Sort: Active first, then by downloads
          const aExpired = a.expiresAt && a.expiresAt.toDate() < now
          const bExpired = b.expiresAt && b.expiresAt.toDate() < now
          
          if (aExpired !== bExpired) {
            return aExpired ? 1 : -1
          }
          
          return (b.supportersCount || 0) - (a.supportersCount || 0)
        })

      setCampaigns(campaignsData)

      // Calculate stats
      const totalDownloads = campaignsData.reduce((sum, c) => sum + (c.supportersCount || 0), 0)
      const memberSince = userData.createdAt 
        ? new Date(userData.createdAt.toDate()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Recently'

      setStats({
        totalCampaigns: campaignsData.length,
        activeCampaigns: campaignsData.filter(c => !c.expiresAt || c.expiresAt.toDate() > now).length,
        totalDownloads,
        totalVisits: 0, // Not tracking visits per user yet
        memberSince
      })

    } catch (error) {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Loading profile..." />
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
          <p className="text-gray-600 mb-4">
            The user @{username} does not exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-secondary hover:bg-secondary/90 text-primary rounded-xl font-semibold transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Profile Hero Section */}
        <div className="bg-white rounded-xl p-6 sm:p-8 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Left: Identity Block */}
            <div className="flex gap-5 items-start flex-1">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar 
                  user={profile} 
                  size="lg" 
                  showBorder={true}
                />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                {/* Name & Verification */}
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                    {profile.displayName || profile.username}
                  </h1>
                  {profile.isVerified && (
                    <CheckBadgeIcon className="w-6 h-6 text-blue-500 flex-shrink-0" title="Verified Creator" />
                  )}
                </div>
                
                {/* Username */}
                <p className="text-base text-primary/60 mb-1">@{profile.username}</p>

                {/* Member Since */}
                {stats && (
                  <p className="text-sm text-primary/50 mb-3">Member since {stats.memberSince}</p>
                )}

                {/* Bio */}
                {profile.bio && (
                  <p className="text-sm text-primary/70 leading-relaxed mb-3">{profile.bio}</p>
                )}

                {/* Location & Website */}
                {(profile.location || profile.website) && (
                  <div className="flex flex-wrap items-center gap-4 text-sm text-primary/60">
                    {profile.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-secondary transition-colors"
                      >
                        <GlobeAltIcon className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">{profile.website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Compact Stat Grid */}
            {stats && (
              <div className="grid grid-cols-3 gap-6 lg:gap-8 w-full lg:w-auto lg:min-w-[280px]">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider text-primary/50 mb-1.5 font-medium">Total</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalCampaigns}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider text-primary/50 mb-1.5 font-medium">Active</p>
                  <p className="text-3xl font-bold text-primary">{stats.activeCampaigns}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider text-primary/50 mb-1.5 font-medium">Downloads</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalDownloads}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Campaigns Section */}
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-primary mb-6">Public Campaigns</h2>

          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600 text-base">This creator has not published any campaigns yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/campaign/${campaign.slug}`}
                  className="group bg-white border border-[#00240010] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <div className={`relative bg-gray-100 ${
                    campaign.aspectRatio === '4:5' ? 'aspect-[4/5]' : 
                    campaign.aspectRatio === '3:4' ? 'aspect-[3/4]' : 
                    'aspect-square'
                  }`}>
                    <img
                      src={campaign.frameURL}
                      alt={campaign.campaignName}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        campaign.status === 'Active' && (!campaign.expiresAt || campaign.expiresAt.toDate() > new Date())
                          ? 'bg-secondary text-primary'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {campaign.status === 'Active' && (!campaign.expiresAt || campaign.expiresAt.toDate() > new Date())
                          ? 'Active'
                          : 'Expired'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-primary text-base sm:text-lg mb-2 group-hover:text-secondary transition-colors line-clamp-1">
                      {campaign.campaignName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-primary/60">
                      <div className="flex items-center gap-1">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        <span>{campaign.supportersCount || 0}</span>
                      </div>
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
