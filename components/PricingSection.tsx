'use client'

import { Check } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'

export default function PricingSection() {
  const { user } = useAuth()
  const router = useRouter()

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/signup')
    }
  }
  const plans = [
    {
      name: '1 Week',
      price: 49,
      days: 7,
      key: 'week',
      popular: false,
      features: ['Campaign visibility', 'Unlimited supporters', 'Analytics tracking', 'QR code generation']
    },
    {
      name: '1 Month',
      price: 199,
      days: 30,
      key: 'month',
      popular: true,
      features: ['Campaign visibility', 'Unlimited supporters', 'Analytics tracking', 'QR code generation', 'Priority support']
    },
    {
      name: '3 Months',
      price: 499,
      days: 90,
      key: '3month',
      popular: false,
      features: ['Campaign visibility', 'Unlimited supporters', 'Analytics tracking', 'QR code generation', 'Priority support', 'Extended reach']
    },
    {
      name: '1 Year',
      price: 1599,
      days: 365,
      key: 'year',
      popular: false,
      features: ['Campaign visibility', 'Unlimited supporters', 'Analytics tracking', 'QR code generation', 'Priority support', 'Extended reach', 'Best value']
    }
  ]

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-base sm:text-lg text-primary/80 max-w-2xl mx-auto mb-4">
            Choose the perfect plan to keep your campaign visible and reach more supporters
          </p>
          <div className="inline-flex items-center gap-2 bg-secondary/20 border-2 border-secondary text-primary px-6 py-3 rounded-xl font-semibold">
            <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Get your first campaign FREE for 1 month!</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative flex flex-col bg-white rounded-2xl border-2 p-6 sm:p-8 transition-all hover:shadow-xl ${
                plan.popular
                  ? 'border-secondary shadow-lg scale-105'
                  : 'border-gray-200 hover:border-secondary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-primary px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-primary mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-primary">₹{plan.price}</span>
                  <span className="text-primary/60 text-sm">/ {plan.days} days</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-primary/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleGetStarted}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all active:scale-95 ${
                  plan.popular
                    ? 'bg-secondary text-primary hover:bg-secondary/90 shadow-md hover:shadow-lg'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center space-y-3">
          <p className="text-primary/70 text-sm sm:text-base">
            All plans include unlimited supporters, full analytics, and no hidden fees. 
            <br className="hidden sm:block" />
            Campaigns remain visible for the duration of your plan.
          </p>
          <p className="text-secondary font-semibold text-base sm:text-lg">
            🎉 New users get their first campaign FREE for 1 month!
          </p>
        </div>
      </div>
    </section>
  )
}
