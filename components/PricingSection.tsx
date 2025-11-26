'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function PricingSection() {
  const { user } = useAuth()
  const router = useRouter()
  const [pricing, setPricing] = useState({
    week: 49,
    month: 99,
    '3month': 249,
    '6month': 499,
    year: 899,
  })
  const [discounts, setDiscounts] = useState({
    week: 0,
    month: 0,
    '3month': 0,
    '6month': 0,
    year: 0,
  })
  const [offersEnabled, setOffersEnabled] = useState(false)

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const [plansDoc, systemDoc] = await Promise.all([
          getDoc(doc(db, 'settings', 'plans')),
          getDoc(doc(db, 'settings', 'system'))
        ])
        
        if (plansDoc.exists()) {
          const data = plansDoc.data()
          setPricing({
            week: data.week ?? 49,
            month: data.month ?? 99,
            '3month': data['3month'] ?? 249,
            '6month': data['6month'] ?? 499,
            year: data.year ?? 899,
          })
          
          setDiscounts({
            week: data.discounts?.week ?? 0,
            month: data.discounts?.month ?? 0,
            '3month': data.discounts?.['3month'] ?? 0,
            '6month': data.discounts?.['6month'] ?? 0,
            year: data.discounts?.year ?? 0,
          })
        }
        
        if (systemDoc.exists()) {
          const systemData = systemDoc.data()
          setOffersEnabled(systemData.offersEnabled ?? false)
        }
      } catch (error) {
        console.error('Failed to fetch pricing:', error)
        // Keep default pricing if fetch fails
      }
    }
    fetchPricing()
  }, [])

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/signup')
    }
  }

  const calculateDiscountedPrice = (key: string) => {
    const price = pricing[key as keyof typeof pricing]
    const discount = discounts[key as keyof typeof discounts]
    if (offersEnabled && discount > 0) {
      return Math.round(price - (price * discount / 100))
    }
    return price
  }

  const getDiscount = (key: string) => {
    return discounts[key as keyof typeof discounts]
  }

  const hasDiscount = (key: string) => {
    return offersEnabled && getDiscount(key) > 0
  }
  
  const plans = [
    {
      name: '1 Week',
      price: pricing.week,
      days: 7,
      key: 'week',
      popular: false,
      features: ['Campaign visibility', 'Unlimited supporters', 'Analytics tracking', 'QR code generation']
    },
    {
      name: '1 Month',
      price: pricing.month,
      days: 30,
      key: 'month',
      popular: true,
      features: ['Campaign visibility', 'Unlimited supporters', 'Analytics tracking', 'QR code generation']
    },
    {
      name: '3 Months',
      price: pricing['3month'],
      days: 90,
      key: '3month',
      popular: false,
      features: ['Campaign visibility', 'Unlimited supporters', 'Analytics tracking', 'QR code generation']
    },
    {
      name: '1 Year',
      price: pricing.year,
      days: 365,
      key: 'year',
      popular: false,
      features: ['Campaign visibility', 'Unlimited supporters', 'Analytics tracking', 'QR code generation']
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
                
                {hasDiscount(plan.key) ? (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {getDiscount(plan.key)}% OFF
                      </span>
                      <span className="text-red-500 text-sm font-semibold">Limited Offer!</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl text-gray-400 line-through">₹{plan.price}</span>
                      <span className="text-4xl font-bold text-emerald-600">₹{calculateDiscountedPrice(plan.key)}</span>
                    </div>
                    <span className="text-primary/60 text-sm">/ {plan.days} days</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold text-primary">₹{plan.price}</span>
                    <span className="text-primary/60 text-sm">/ {plan.days} days</span>
                  </div>
                )}

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
        <div className="mt-12 space-y-6">
          <div className="bg-gradient-to-r from-secondary/20 to-secondary/10 border-2 border-secondary rounded-2xl p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3 className="text-2xl sm:text-3xl font-bold text-primary">
                First Campaign FREE for 1 Month!
              </h3>
            </div>
            <p className="text-primary/80 text-base sm:text-lg">
              New users get their first campaign completely free for 30 days. No credit card required to start.
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <p className="text-primary/70 text-sm sm:text-base">
              All plans include unlimited supporters, full analytics, QR codes, and no hidden fees.
            </p>
            <p className="text-primary/60 text-sm">
              <strong>What happens after expiry?</strong> Campaigns are archived but can be renewed anytime. 
              <br className="hidden sm:inline" /> Download your analytics before expiry to keep your data.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
