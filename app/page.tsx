'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'

export default function Home() {
  const { user } = useAuth()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Phrames',
    url: 'https://phrames.cleffon.com',
    description: 'Create and share custom photo frame campaigns online for free.',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'All',
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
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
                  className="w-full h-auto rounded-2xl shadow-lg"
                  priority
                />
              </div>
            </div>
          </div>
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
                    className="inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95 w-full sm:w-auto"
                  >
                    Create Your Campaign
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95 w-full sm:w-auto"
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