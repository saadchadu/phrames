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
import UseCasesSection from '@/components/UseCasesSection'
import FeaturesShowcase from '@/components/FeaturesShowcase'
import ExampleGallery from '@/components/ExampleGallery'
import FAQSection from '@/components/FAQSection'
import Footer from '@/components/Footer'
import { toast } from '@/components/ui/toaster'
import { Play } from 'lucide-react'

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
              <div className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/30 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                <span>🎉 First campaign FREE for 1 month!</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-bold text-primary mb-4 sm:mb-6 leading-tight">
                Create Viral Photo Frames for Your Campaign 
                <span className="text-secondary block mt-1">in Minutes</span>
              </h1>
              <p className="text-base sm:text-lg text-primary/80 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Perfect for events, brands, causes, and celebrations. Let your supporters spread your message with custom photo frames.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-6">
                {user ? (
                  <>
                    <Link
                      href="/create"
                      className="inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                      Start Free Trial
                    </Link>
                    <a
                      href="#how-it-works"
                      className="inline-flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-primary border-2 border-gray-200 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      <Play className="w-5 h-5" />
                      See How It Works
                    </a>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                      Start Free Trial
                    </Link>
                    <a
                      href="#how-it-works"
                      className="inline-flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-primary border-2 border-gray-200 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      <Play className="w-5 h-5" />
                      See How It Works
                    </a>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-primary/70">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Setup in 30 seconds</span>
                </div>
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
            <div className="flex items-center gap-3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-white">
                Trending Campaigns
              </h2>
              {campaigns.length === 0 && !loading && (
                <span className="bg-secondary/20 border border-secondary text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Coming Soon
                </span>
              )}
            </div>
            <p className="text-base sm:text-lg text-white/90 text-center">
              {campaigns.length === 0 && !loading 
                ? 'Check back soon for inspiring campaigns from our community!'
                : 'Discover the most popular campaigns at phrames'
              }
            </p>
          </div>

          {campaigns.length > 0 && (
            <>
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
            </>
          )}

          {campaigns.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
                <svg className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Be the First to Create!</h3>
              <p className="text-white/80 mb-6 max-w-md mx-auto">
                Start your campaign today and be featured in our trending section
              </p>
              <Link
                href={user ? '/create' : '/signup'}
                className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-primary px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Create First Campaign
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Use Cases Section */}
      <UseCasesSection />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#00dd781a' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] font-bold text-center text-primary mb-4">
            How It Works
          </h2>
          <p className="text-center text-primary/80 text-base sm:text-lg mb-12 max-w-2xl mx-auto">
            Launch your viral campaign in 4 simple steps
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex flex-col items-center sm:items-start gap-4 sm:gap-5 bg-white/70 backdrop-blur-sm sm:bg-white/50 p-6 sm:p-6 rounded-2xl hover:bg-white transition-all">
              <div className="w-12 h-12 sm:w-[50px] sm:h-[50px] bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-secondary text-2xl sm:text-[28px] font-bold">1</span>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3 w-full text-center sm:text-left">
                <h3 className="text-primary text-xl sm:text-[24px] font-semibold leading-tight">Sign Up</h3>
                <p className="text-primary/80 text-sm sm:text-base font-normal leading-relaxed">
                  Create your free account in 30 seconds. No credit card required to start.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-4 sm:gap-5 bg-white/70 backdrop-blur-sm sm:bg-white/50 p-6 sm:p-6 rounded-2xl hover:bg-white transition-all">
              <div className="w-12 h-12 sm:w-[50px] sm:h-[50px] bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-secondary text-2xl sm:text-[28px] font-bold">2</span>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3 w-full text-center sm:text-left">
                <h3 className="text-primary text-xl sm:text-[24px] font-semibold leading-tight">Upload Frame</h3>
                <p className="text-primary/80 text-sm sm:text-base font-normal leading-relaxed">
                  Upload PNG with transparency. Recommended size: 1080x1080px for best quality.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-4 sm:gap-5 bg-white/70 backdrop-blur-sm sm:bg-white/50 p-6 sm:p-6 rounded-2xl hover:bg-white transition-all">
              <div className="w-12 h-12 sm:w-[50px] sm:h-[50px] bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-secondary text-2xl sm:text-[28px] font-bold">3</span>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3 w-full text-center sm:text-left">
                <h3 className="text-primary text-xl sm:text-[24px] font-semibold leading-tight">Customize & Share</h3>
                <p className="text-primary/80 text-sm sm:text-base font-normal leading-relaxed">
                  Get a unique link + QR code to share everywhere. Print or post online.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-4 sm:gap-5 bg-white/70 backdrop-blur-sm sm:bg-white/50 p-6 sm:p-6 rounded-2xl hover:bg-white transition-all">
              <div className="w-12 h-12 sm:w-[50px] sm:h-[50px] bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-secondary text-2xl sm:text-[28px] font-bold">4</span>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3 w-full text-center sm:text-left">
                <h3 className="text-primary text-xl sm:text-[24px] font-semibold leading-tight">Track & Engage</h3>
                <p className="text-primary/80 text-sm sm:text-base font-normal leading-relaxed">
                  See real-time stats: views, downloads, shares, and supporter locations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Example Gallery Section */}
      <ExampleGallery />

      {/* Features Showcase Section */}
      <FeaturesShowcase />

      {/* Pricing Section */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* FAQ Section */}
      <div id="faq">
        <FAQSection />
      </div>

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
      <Footer />
    </main>
    </>
  )
}