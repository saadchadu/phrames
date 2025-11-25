import { Cashfree, CFEnvironment } from 'cashfree-pg'

// Initialize Cashfree SDK instance
let cashfreeInstance: Cashfree | null = null

export function getCashfreeInstance(): Cashfree {
  if (!cashfreeInstance) {
    const environment = process.env.CASHFREE_ENV === 'PRODUCTION' 
      ? CFEnvironment.PRODUCTION 
      : CFEnvironment.SANDBOX
    
    const clientId = process.env.CASHFREE_CLIENT_ID
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET
    
    if (!clientId || !clientSecret) {
      throw new Error('Cashfree credentials are not configured')
    }
    
    cashfreeInstance = new Cashfree(
      environment,
      clientId,
      clientSecret
    )
  }
  return cashfreeInstance
}

export { Cashfree, CFEnvironment }

// Pricing plans configuration
// NOTE: These are fallback values. Actual prices are fetched from Firestore settings/plans
export const PRICING_PLANS = {
  free: { name: 'Free', price: 0, days: 30 }, // Free plan - 1 month validity
  week: { name: '1 Week', price: 49, days: 7 },
  month: { name: '1 Month', price: 99, days: 30 },
  '3month': { name: '3 Months', price: 249, days: 90 },
  '6month': { name: '6 Months', price: 499, days: 180 },
  year: { name: '1 Year', price: 899, days: 365 }
} as const

export type PlanType = keyof typeof PRICING_PLANS

// Get plan price (returns 0 for free plan)
export function getPlanPrice(planType: PlanType): number {
  return PRICING_PLANS[planType].price
}

// Get plan days (returns 0 for free plan)
export function getPlanDays(planType: PlanType): number {
  return PRICING_PLANS[planType].days
}

// Calculate expiry date (includes free plan with 30 days)
export function calculateExpiryDate(planType: PlanType): Date {
  const days = getPlanDays(planType)
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + days)
  return expiryDate
}

// Validate plan type
export function isValidPlanType(planType: string): planType is PlanType {
  return planType in PRICING_PLANS
}

// Re-export Cashfree configuration validation from env-validation
export { validateCashfreeConfig as verifyCashfreeConfig } from './env-validation'
