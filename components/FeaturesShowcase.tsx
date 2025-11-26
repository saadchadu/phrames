'use client'

import { Users, TrendingUp, QrCode, Share2, Droplet, Zap } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Unlimited Supporters',
    description: 'No caps on how many people can use your frame'
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Analytics',
    description: 'Track views, downloads, and shares by location'
  },
  {
    icon: QrCode,
    title: 'QR Code Generator',
    description: 'Print-ready codes for offline promotion'
  },
  {
    icon: Share2,
    title: 'Social Media Ready',
    description: 'Optimized for Instagram, Facebook, WhatsApp'
  },
  {
    icon: Droplet,
    title: 'No Watermarks',
    description: 'Clean, professional frames every time'
  },
  {
    icon: Zap,
    title: 'Instant Sharing',
    description: 'One-click download and share functionality'
  }
]

export default function FeaturesShowcase() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#00dd781a' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
            Everything You Need to Go Viral
          </h2>
          <p className="text-base sm:text-lg text-primary/80 max-w-2xl mx-auto">
            Powerful features designed to maximize your campaign's reach and impact
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="flex items-start gap-4 bg-white/70 backdrop-blur-sm rounded-2xl p-6 hover:bg-white transition-all"
              >
                <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-primary/70 text-sm sm:text-base">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
