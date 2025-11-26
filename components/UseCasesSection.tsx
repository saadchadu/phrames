'use client'

import { Users, Megaphone, Heart, PartyPopper, DollarSign, Sparkles } from 'lucide-react'

const useCases = [
  {
    icon: Users,
    title: 'Political Campaigns',
    description: 'Create election profile frames to rally supporters and spread your message',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    icon: Megaphone,
    title: 'Brand Marketing',
    description: 'Launch products with custom frames that turn customers into brand ambassadors',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    icon: Heart,
    title: 'Social Causes',
    description: 'Raise awareness for important causes with shareable campaign frames',
    color: 'bg-red-50 text-red-600'
  },
  {
    icon: PartyPopper,
    title: 'Events & Weddings',
    description: 'Make celebrations memorable with personalized photo frames for guests',
    color: 'bg-pink-50 text-pink-600'
  },
  {
    icon: DollarSign,
    title: 'Fundraisers',
    description: 'Boost charity campaigns with frames that show supporter solidarity',
    color: 'bg-green-50 text-green-600'
  },
  {
    icon: Sparkles,
    title: 'Festivals & Holidays',
    description: 'Create seasonal frames for holidays, festivals, and special occasions',
    color: 'bg-yellow-50 text-yellow-600'
  }
]

export default function UseCasesSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
            Perfect For Every Campaign
          </h2>
          <p className="text-base sm:text-lg text-primary/80 max-w-2xl mx-auto">
            From political movements to personal celebrations, Phrames helps you create viral moments
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-100 hover:border-secondary/50 transition-all hover:shadow-lg"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${useCase.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">
                  {useCase.title}
                </h3>
                <p className="text-primary/70 text-sm sm:text-base leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
