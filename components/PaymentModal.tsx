'use client'

import { useState, Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CheckIcon, TagIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
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

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; finalAmount: number } | null>(null)
  const [couponError, setCouponError] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

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
        setError('Failed to load payment plans. Please try again.')
        setLoadingPlans(false)
      }
    }

    if (isOpen) {
      fetchPlans()
      // reset state on open
      setSelectedPlan(null)
      setAppliedCoupon(null)
      setCouponCodeInput('')
      setCouponError('')
      setError('')
    }
  }, [isOpen])

  // Clear coupon if plan changes
  useEffect(() => {
    setAppliedCoupon(null)
    setCouponError('')
  }, [selectedPlan])

  const handleApplyCoupon = async () => {
    if (!selectedPlan) {
      setCouponError('Please select a plan first')
      return
    }
    if (!couponCodeInput.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setIsApplyingCoupon(true)
    setCouponError('')

    try {
      const { auth } = await import('@/lib/firebase')
      const user = auth.currentUser
      if (!user) throw new Error('Must be logged in to apply coupon')
      const token = await user.getIdToken()

      const plan = plans.find(p => p.id === selectedPlan)
      if (!plan) throw new Error('Selected plan not found')

      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: couponCodeInput,
          plan: selectedPlan,
          amount: plan.price
        })
      })

      const data = await response.json()
      if (data.valid) {
        setAppliedCoupon({
          code: data.code,
          discountAmount: data.discountAmount,
          finalAmount: data.finalAmount
        })
        setCouponError('')
      } else {
        setAppliedCoupon(null)
        setCouponError(data.message || 'Invalid coupon')
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to apply coupon')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

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

      // Check email verification
      if (!user.emailVerified) {
        throw new Error('Please verify your email address before making a payment. Check your inbox for the verification link.')
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
          couponCode: appliedCoupon?.code || undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment')
      }

      if (!data.paymentSessionId) {
        throw new Error('Payment session ID not received from server')
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
        const mode = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'PRODUCTION' ? 'production' : 'sandbox'

        const cashfree = Cashfree({
          mode: mode
        })

        // Open checkout - Cashfree v3 SDK handles redirect automatically
        const checkoutOptions = {
          paymentSessionId: data.paymentSessionId,
          returnUrl: `${window.location.origin}/dashboard?payment=success&campaignId=${campaignId}`
        }

        // Call checkout - it will redirect automatically
        await cashfree.checkout(checkoutOptions)
      } else {
        throw new Error('No payment session received')
      }
    } catch (error: any) {
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
                      Activate "{campaignName}" with a subscription plan.<br />
                      <span className="text-xs opacity-75 mt-1 block">Note: All plans include the exact same features, only the validity period changes.</span>
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
                        className={`relative p-5 rounded-xl border-2 transition-all text-left ${selectedPlan === plan.id
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

                      </button>
                    ))}
                  </div>
                )}

                {/* Coupon Code Section */}
                {!loadingPlans && plans.length > 0 && selectedPlan && (
                  <div className="mb-6">
                    <label htmlFor="coupon-input" className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-2 text-left">
                      Promo Code
                    </label>
                    <div className="relative flex items-center mb-2 group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <TagIcon className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" aria-hidden="true" />
                      </div>
                      <input
                        type="text"
                        id="coupon-input"
                        placeholder="ENTER CODE"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        disabled={loading || isApplyingCoupon || !!appliedCoupon}
                        className="block w-full pl-11 pr-[100px] py-4 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono uppercase text-[15px] font-bold shadow-sm disabled:opacity-60 disabled:bg-gray-50"
                      />

                      <div className="absolute right-2 flex items-center">
                        {appliedCoupon ? (
                          <button
                            onClick={() => {
                              setAppliedCoupon(null)
                              setCouponCodeInput('')
                            }}
                            disabled={loading}
                            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-lg text-xs font-bold transition-all"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={handleApplyCoupon}
                            disabled={loading || isApplyingCoupon || !couponCodeInput.trim()}
                            className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] flex items-center justify-center shadow-sm"
                          >
                            {isApplyingCoupon ? (
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : 'Apply'}
                          </button>
                        )}
                      </div>
                    </div>

                    {couponError && (
                      <p className="text-red-500 text-[13px] mt-2 font-medium text-left flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                        <ExclamationCircleIcon className="w-4 h-4" />
                        {couponError}
                      </p>
                    )}

                    {/* Price Breakdown */}
                    {appliedCoupon && (
                      <div className="mt-5 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-3 text-sm animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between text-gray-600 font-medium">
                          <span>Original Price</span>
                          <span className="line-through text-gray-400">₹{plans.find(p => p.id === selectedPlan)?.price}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span className="flex items-center gap-1.5">Discount ({appliedCoupon.code})</span>
                          <span>-₹{appliedCoupon.discountAmount}</span>
                        </div>
                        <div className="flex justify-between text-gray-900 font-bold text-lg pt-3 border-t border-emerald-200/50">
                          <span>Total to Pay</span>
                          <span>₹{appliedCoupon.finalAmount}</span>
                        </div>
                      </div>
                    )}
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
