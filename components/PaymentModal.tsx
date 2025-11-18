'use client'

import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'
import { PRICING_PLANS, PlanType } from '@/lib/cashfree'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  campaignName: string
  onSuccess: () => void
}

interface PricingPlan {
  id: PlanType
  name: string
  price: number
  days: number
  popular?: boolean
}

const PLANS: PricingPlan[] = [
  { id: 'week', name: '1 Week', price: 49, days: 7 },
  { id: 'month', name: '1 Month', price: 199, days: 30, popular: true },
  { id: '3month', name: '3 Months', price: 499, days: 90 },
  { id: '6month', name: '6 Months', price: 999, days: 180 },
  { id: 'year', name: '1 Year', price: 1599, days: 365 }
]

export default function PaymentModal({ isOpen, onClose, campaignId, campaignName, onSuccess }: PaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleContinue = async () => {
    if (!selectedPlan) return

    setLoading(true)
    setError('')

    try {
      // Get Firebase auth token
      const { auth } = await import('@/lib/firebase')
      const user = auth.currentUser
      if (!user) {
        throw new Error('You must be logged in to make a payment')
      }

      const token = await user.getIdToken()

      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaignId,
          planType: selectedPlan,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment')
      }

      if (data.paymentLink) {
        // Redirect to Cashfree payment page
        window.location.href = data.paymentLink
      } else {
        throw new Error('No payment link received')
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error)
      setError(error.message || 'Failed to initiate payment. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-2xl sm:text-3xl font-bold text-primary leading-tight"
                    >
                      Choose Your Plan
                    </Dialog.Title>
                    <p className="mt-2 text-sm sm:text-base text-primary/70">
                      Activate "{campaignName}" with a subscription plan
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-primary/60 hover:text-primary transition-colors p-1"
                    disabled={loading}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Pricing Plans Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      disabled={loading}
                      className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                        selectedPlan === plan.id
                          ? 'border-secondary bg-secondary/5 shadow-md'
                          : 'border-[#00240020] hover:border-[#00240040] hover:shadow-sm'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {/* Popular Badge */}
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-primary shadow-sm">
                            Popular
                          </span>
                        </div>
                      )}

                      {/* Selected Indicator */}
                      {selectedPlan === plan.id && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                            <CheckIcon className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      )}

                      {/* Plan Details */}
                      <div className="flex flex-col gap-2">
                        <h4 className="text-lg font-bold text-primary">{plan.name}</h4>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-primary">₹{plan.price}</span>
                        </div>
                        <p className="text-sm text-primary/60">{plan.days} days of access</p>
                      </div>

                      {/* Features */}
                      <div className="mt-4 pt-4 border-t border-[#00240010]">
                        <ul className="space-y-2 text-sm text-primary/70">
                          <li className="flex items-center gap-2">
                            <CheckIcon className="h-4 w-4 text-secondary flex-shrink-0" />
                            <span>Full campaign access</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckIcon className="h-4 w-4 text-secondary flex-shrink-0" />
                            <span>Public visibility</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckIcon className="h-4 w-4 text-secondary flex-shrink-0" />
                            <span>Analytics tracking</span>
                          </li>
                        </ul>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl border border-[#00240020] text-primary hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContinue}
                    disabled={!selectedPlan || loading}
                    className="px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/90 text-primary font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      'Continue to Checkout'
                    )}
                  </button>
                </div>

                {/* Security Note */}
                <p className="mt-4 text-xs text-center text-primary/50">
                  Secure payment powered by Cashfree • Your payment information is encrypted
                </p>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
