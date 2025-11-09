'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'

export default function Home() {
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-[6em] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Left Side - Content (60%) */}
            <div className="w-full lg:w-[50%] text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6">
                Create Beautiful Photo Frames And 
                <span className="text-secondary block">Share to
the Globe</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Phrames is a free, easy-to-use platform for creating custom photo frame campaigns. Upload your PNG frames and let visitors create personalized images instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 text-primary px-[26px] py-[18px] rounded-md text-[16px] font-medium transition-colors whitespace-nowrap"
                    >
                      Go to Dashboard
                    </Link>
                    <Link
                      href="/create"
                      className="inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/90 text-white px-[26px] py-[18px] rounded-md text-[16px] font-medium transition-colors whitespace-nowrap"
                    >
                      Create a Campaign
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 text-primary px-[26px] py-[18px] rounded-md text-[16px] font-medium transition-colors whitespace-nowrap"
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/90 text-white px-[26px] py-[18px] rounded-md text-[16px] font-medium transition-colors whitespace-nowrap"
                    >
                      Create a Campaign
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Side - Image (40%) */}
            <div className="w-full lg:w-[50%] flex justify-end">
              <div className="w-[70%] relative">
                <Image
                  src="/images/Hero.png"
                  alt="Phrames Hero"
                  width={450}
                  height={490}
                  className="w-full h-auto rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-[6em] px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#00dd781a' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-start gap-5">
              <div className="w-[50px] h-[50px] bg-primary rounded-full flex items-center justify-center">
                <span className="text-secondary text-[28px] font-bold leading-[33.6px]">1</span>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <h3 className="text-primary text-[30px] font-semibold leading-[36px]">Sign Up</h3>
                <p className="text-primary text-[15px] font-normal leading-[22.5px]">
                  Create your free creator account and start building your first campaign.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-5">
              <div className="w-[50px] h-[50px] bg-primary rounded-full flex items-center justify-center">
                <span className="text-secondary text-[28px] font-bold leading-[33.6px]">2</span>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <h3 className="text-primary text-[30px] font-semibold leading-[36px]">Upload Frame</h3>
                <p className="text-primary text-[15px] font-normal leading-[22.5px]">
                  Upload a PNG image with transparency to create your custom frame design.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-5">
              <div className="w-[50px] h-[50px] bg-primary rounded-full flex items-center justify-center">
                <span className="text-secondary text-[28px] font-bold leading-[33.6px]">3</span>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <h3 className="text-primary text-[30px] font-semibold leading-[36px]">Share Link</h3>
                <p className="text-primary text-[15px] font-normal leading-[22.5px]">
                  Get a unique link to share your campaign with friends and supporters.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-5">
              <div className="w-[50px] h-[50px] bg-primary rounded-full flex items-center justify-center">
                <span className="text-secondary text-[28px] font-bold leading-[33.6px]">4</span>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <h3 className="text-primary text-[30px] font-semibold leading-[36px]">Track Engagement</h3>
                <p className="text-primary text-[15px] font-normal leading-[22.5px]">
                  Monitor how many people are using your frame and sharing their photos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className=" bg-primary overflow-hidden">
        <div className=" mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Left Column - Text */}
            <div className="w-full lg:w-1/2 pl-24">
              <div className="flex flex-col gap-5">
                <h2 className="text-[40px] font-bold text-[#f2fff2] leading-[50px]">
                  Turn your campaign into a shared visual moment.
                </h2>
                <p className="text-[19px] font-normal text-[#f2fff2] leading-[28.5px]">
                  Create shareable photo frames that help your message spread across social media.
                </p>
                {user ? (
                  <Link
                    href="/create"
                    className="inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 text-primary px-[26px] py-[18px] rounded-md text-[16px] font-medium transition-colors whitespace-nowrap w-fit"
                  >
                    Create Your Campaign
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 text-primary px-[26px] py-[18px] rounded-md text-[16px] font-medium transition-colors whitespace-nowrap w-fit"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="w-full lg:w-1/2">
              <Image
                src="/images/Strip.png"
                alt="CTA Visual"
                width={720}
                height={455}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col items-center justify-center gap-2.5 py-8 px- sm:px-6 lg:px-[95px]">
        <div className="flex items-center justify-between w-full max-w-8xl">
          <Image
            src="/logos/Logo-black.svg"
            alt="Phrames Logo"
            width={103}
            height={25}
            className="h-[24.7px] w-[103px]"
          />
          <div className="flex items-center gap-[23px]">
            <p className="text-primary text-[16px] font-medium leading-normal whitespace-nowrap">
              copyright reserved to <a href="http://cleffon.com">cleffon</a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}