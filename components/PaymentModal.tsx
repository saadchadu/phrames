'use client'

import { useState, Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'
import { PRICING_PLANS, PlanType } from '@/lib/cashfree'
import { getEnabledPlans } from '@/lib/feature-toggles'

// Cashfree SDK types
interface CashfreeCheckoutOptions {
  paymentSessionId: string
  returnUrl?: string
  notifyUrl?: string
  redirectTarget?: '_self' | '_blank' | '_parent' | '_top'
}

interface CashfreeSDK {
  checkout(options: CashfreeCheckoutOptions): void
}

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
  originalPrice?: number
  discount?: number
  days: number
  popular?: boolean
  enabled: boolean
}

const PLAN_DETAILS: { [key: string]: { name: string; days: number; popular?: boolean } } = {
  week: { name: '1 Week', days: 7 },
  month: { name: '1 Month', days: 30, popular: true },
  '3month': { name: '3 Months', days: 90 },
  '6month': { name: '6 Months', days: 180 },
  year: { name: '1 Year', days: 365 }
}

export default function PaymentModal({ isOpen, onClose, campaignId, campaignName, onSuccess }: PaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { plans: enabledPlans, allDisabled } = await getEnabledPlans()
        
        if (allDisabled) {
          setError('No payment plans are currently available. Please contact support.')
          setLoadingPlans(false)
          return
        }
        
        const planList: PricingPlan[] = Object.entries(enabledPlans)
          .filter(([_, plan]) => plan.enabled)
          .map(([id, plan]) => ({
            id: id as PlanType,
            name: PLAN_DETAILS[id].name,
            price: plan.price,
            originalPrice: plan.originalPrice,
            discount: plan.discount,
            days: PLAN_DETAILS[id].days,
            popular: PLAN_DETAILS[id].popular,
            enabled: plan.enabled
          }))
        
        setPlans(planList)
        setLoadingPlans(false)
      } catch (error) {
        console.error('Error fetching plans:', error)
        setError('Failed to load payment plans. Please try again.')
        setLoadingPlans(false)
      }
    }
    
    if (isOpen) {
      fetchPlans()
    }
  }, [isOpen])

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

      if (data.paymentSessionId) {
        // Wait for Cashfree SDK to load
        const waitForCashfree = (): Promise<any> => {
          return new Promise((resolve, reject) => {
            let attempts = 0
            const maxAttempts = 50 // 5 seconds max wait
            
            const checkCashfree = () => {
              if ((window as any).Cashfree) {
                resolve((window as any).Cashfree)
              } else if (attempts < maxAttempts) {
                attempts++
                setTimeout(checkCashfree, 100)
              } else {
                reject(new Error('Cashfree SDK failed to load'))
              }
            }
            
            checkCashfree()
          })
        }

        const Cashfree = await waitForCashfree()
        
        // Initialize Cashfree with environment
        const cashfree = Cashfree({
          mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'PRODUCTION' ? 'production' : 'sandbox'
        })

        // Open checkout
        const checkoutOptions = {
          paymentSessionId: data.paymentSessionId,
          returnUrl: `${window.location.origin}/dashboard?payment=success&campaignId=${campaignId}`
        }

        cashfree.checkout(checkoutOptions)
      } else {
        throw new Error('No payment session received')
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
                    aria-label="Close payment modal"
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

                {/* Loading State */}
                {loadingPlans && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                )}

                {/* Pricing Plans Grid */}
                {!loadingPlans && plans.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {plans.map((plan) => (
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
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-primary">{plan.name}</h4>
                          {plan.discount && plan.discount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                              {plan.discount}% OFF
                            </span>
                          )}
                        </div>
                        {plan.originalPrice && plan.discount && plan.discount > 0 ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg text-gray-400 line-through">₹{plan.originalPrice}</span>
                            <span className="text-3xl font-bold text-emerald-600">₹{plan.price}</span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-primary">₹{plan.price}</span>
                          </div>
                        )}
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
                )}

                {/* No Plans Available */}
                {!loadingPlans && plans.length === 0 && !error && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No payment plans are currently available.</p>
                  </div>
                )}

                {/* Action Buttons */}
                {!loadingPlans && plans.length > 0 && (
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
                )}

                {/* Security Note */}
                {!loadingPlans && plans.length > 0 && (
                  <p className="mt-4 text-xs text-center text-primary/50">
                    Secure payment powered by Cashfree • Your payment information is encrypted
                  </p>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
