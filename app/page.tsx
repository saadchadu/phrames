'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { getPublicActiveCampaigns, Campaign } from '@/lib/firestore'
import SearchInput from '@/components/SearchInput'
import SearchResults from '@/components/SearchResults'
import PricingSection from '@/components/PricingSection'
import { toast } from '@/components/ui/toaster'

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch public active campaigns on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true)
        const publicCampaigns = await getPublicActiveCampaigns()
        setCampaigns(publicCampaigns)
      } catch (error) {
        console.error('Failed to fetch campaigns:', error)
        toast('Failed to load campaigns. Please refresh the page.', 'error')
        setCampaigns([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchCampaigns()
  }, [])

  // Get top 8 trending campaigns based on supporters count
  const trendingCampaigns = useMemo(() => {
    // Sort by supporters count in descending order and take top 8
    return [...campaigns]
      .sort((a, b) => b.supportersCount - a.supportersCount)
      .slice(0, 8)
  }, [campaigns])

  // Filter campaigns based on search query
  const filteredCampaigns = useMemo(() => {
    const campaignsToFilter = searchQuery.trim() ? campaigns : trendingCampaigns

    if (!searchQuery.trim()) {
      return campaignsToFilter
    }

    const lowerQuery = searchQuery.toLowerCase()
    return campaignsToFilter.filter(campaign => {
      const nameMatch = campaign.campaignName.toLowerCase().includes(lowerQuery)
      const descMatch = campaign.description?.toLowerCase().includes(lowerQuery) || false
      return nameMatch || descMatch
    })
  }, [campaigns, trendingCampaigns, searchQuery])

  const handleCampaignClick = (slug: string) => {
    router.push(`/campaign/${slug}`)
  }

  const handleSearch = () => {
    // Search is already handled by the useMemo filter
    // This function is for the button click if needed
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Phrames',
    url: 'https://phrames.cleffon.com',
    description: 'Create and share custom photo frame campaigns online for free.',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'Cleffon',
      url: 'https://cleffon.com',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.supportersCount, 0) : '100',
    },
    featureList: [
      'Upload custom PNG frames',
      'Create photo frame campaigns',
      'Share campaign links',
      'Track supporters',
      'Download high-resolution images',
      'No watermarks',
      'Free to use'
    ],
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://phrames.cleffon.com',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            {/* Left Side - Content */}
            <div className="w-full lg:w-[55%] text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-bold text-primary mb-4 sm:mb-6 leading-tight">
                Create Beautiful Photo Frames And 
                <span className="text-secondary block mt-1">Share to the Globe</span>
              </h1>
              <p className="text-base sm:text-lg text-primary/80 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Phrames is a free, easy-to-use platform for creating custom photo frame campaigns. Upload your PNG frames and let visitors create personalized images instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      Go to Dashboard
                    </Link>
                    <Link
                      href="/create"
                      className="inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      Create a Campaign
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      Create a Campaign
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="w-full lg:w-[45%] flex justify-center lg:justify-end mt-8 lg:mt-0">
              <div className="w-full max-w-sm lg:max-w-md relative">
                <Image
                  src="/images/Hero.png"
                  alt="Phrames Hero"
                  width={450}
                  height={490}
                  className="w-full h-auto rounded-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Search Section */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <div className="flex flex-col items-center gap-4 mb-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-white">
              Trending Campaigns
            </h2>
            <p className="text-base sm:text-lg text-white/90 text-center">
              Discover the most popular campaigns at phrames
            </p>
          </div>

          {/* Search Input and Button */}
          <div className="flex flex-col items-center justify-center sm:flex-row items-stretch sm:items-end gap-5 mb-10">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Search your campaigns"
            />
            <button
              onClick={handleSearch}
              className="w-full sm:w-[196px] bg-secondary hover:bg-secondary/90 text-primary px-[26px] py-[22px] rounded-lg text-sm sm:text-base font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 min-h-[44px]"
            >
              Find Campaign
            </button>
          </div>

          {/* Search Results */}
          <SearchResults
            campaigns={filteredCampaigns}
            loading={loading}
            searchQuery={searchQuery}
            onCampaignClick={handleCampaignClick}
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#00dd781a' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] font-bold text-center text-primary mb-8 sm:mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex flex-col items-center sm:items-start gap-4 sm:gap-5 bg-white/50 sm:bg-transparent p-6 sm:p-0 rounded-2xl sm:rounded-none">
              <div className="w-12 h-12 sm:w-[50px] sm:h-[50px] bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-secondary text-2xl sm:text-[28px] font-bold">1</span>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3 w-full text-center sm:text-left">
                <h3 className="text-primary text-xl sm:text-[24px] font-semibold leading-tight">Sign Up</h3>
                <p className="text-primary/80 text-sm sm:text-base font-normal leading-relaxed">
                  Create your free creator account and start building your first campaign.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-4 sm:gap-5 bg-white/50 sm:bg-transparent p-6 sm:p-0 rounded-2xl sm:rounded-none">
              <div className="w-12 h-12 sm:w-[50px] sm:h-[50px] bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-secondary text-2xl sm:text-[28px] font-bold">2</span>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3 w-full text-center sm:text-left">
                <h3 className="text-primary text-xl sm:text-[24px] font-semibold leading-tight">Upload Frame</h3>
                <p className="text-primary/80 text-sm sm:text-base font-normal leading-relaxed">
                  Upload a PNG image with transparency to create your custom frame design.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-4 sm:gap-5 bg-white/50 sm:bg-transparent p-6 sm:p-0 rounded-2xl sm:rounded-none">
              <div className="w-12 h-12 sm:w-[50px] sm:h-[50px] bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-secondary text-2xl sm:text-[28px] font-bold">3</span>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3 w-full text-center sm:text-left">
                <h3 className="text-primary text-xl sm:text-[24px] font-semibold leading-tight">Share Link</h3>
                <p className="text-primary/80 text-sm sm:text-base font-normal leading-relaxed">
                  Get a unique link to share your campaign with friends and supporters.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-4 sm:gap-5 bg-white/50 sm:bg-transparent p-6 sm:p-0 rounded-2xl sm:rounded-none">
              <div className="w-12 h-12 sm:w-[50px] sm:h-[50px] bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-secondary text-2xl sm:text-[28px] font-bold">4</span>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3 w-full text-center sm:text-left">
                <h3 className="text-primary text-xl sm:text-[24px] font-semibold leading-tight">Track Engagement</h3>
                <p className="text-primary/80 text-sm sm:text-base font-normal leading-relaxed">
                  Monitor how many people are using your frame and sharing their photos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="bg-primary overflow-hidden">
        <div className="mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Left Column - Text */}
            <div className="w-full lg:w-1/2 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-12 sm:py-16 lg:py-20">
              <div className="flex flex-col gap-4 sm:gap-5 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] font-bold text-[#f2fff2] leading-tight">
                  Turn your campaign into a shared visual moment.
                </h2>
                <p className="text-base sm:text-lg text-[#f2fff2]/90 leading-relaxed">
                  Create shareable photo frames that help your message spread across social media.
                </p>
                {user ? (
                  <Link
                    href="/create"
                    className="inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 w-fit sm:w-fit"
                  >
                    Create Your Campaign
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 w-fit sm:w-fit"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="w-full lg:w-1/2 order-first lg:order-last">
              <Image
                src="/images/Strip.png"
                alt="CTA Visual"
                width={720}
                height={455}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Image
              src="/logos/Logo-black.svg"
              alt="Phrames Logo"
              width={103}
              height={25}
              className="h-6 w-auto"
            />
            <p className="text-primary/70 text-sm sm:text-base font-medium text-center sm:text-right">
              copyright reserved to <a href="http://cleffon.com" className="text-secondary hover:underline">cleffon</a>
            </p>
          </div>
        </div>
      </footer>
    </main>
    </>
  )
}