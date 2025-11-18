/**
 * Environment Variable Validation
 * 
 * This module validates required environment variables on application startup.
 * It prevents the application from running with missing or invalid configuration.
 */

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validates all required environment variables
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Firebase Client Configuration (Required)
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    errors.push('NEXT_PUBLIC_FIREBASE_API_KEY is not configured')
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) {
    errors.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is not configured')
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    errors.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not configured')
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
    errors.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not configured')
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) {
    errors.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is not configured')
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID) {
    errors.push('NEXT_PUBLIC_FIREBASE_APP_ID is not configured')
  }

  // Firebase Admin Configuration (Required for server-side operations)
  if (!process.env.FIREBASE_PROJECT_ID) {
    errors.push('FIREBASE_PROJECT_ID is not configured')
  }
  if (!process.env.FIREBASE_CLIENT_EMAIL) {
    errors.push('FIREBASE_CLIENT_EMAIL is not configured')
  }
  if (!process.env.FIREBASE_PRIVATE_KEY) {
    errors.push('FIREBASE_PRIVATE_KEY is not configured')
  }

  // Cashfree Payment Configuration (Required for payment processing)
  if (!process.env.CASHFREE_CLIENT_ID) {
    errors.push('CASHFREE_CLIENT_ID is not configured - payment processing will fail')
  }
  if (!process.env.CASHFREE_CLIENT_SECRET) {
    errors.push('CASHFREE_CLIENT_SECRET is not configured - payment processing will fail')
  }
  if (!process.env.CASHFREE_ENV) {
    errors.push('CASHFREE_ENV is not configured - defaulting to SANDBOX')
    warnings.push('CASHFREE_ENV not set, using SANDBOX mode')
  } else if (process.env.CASHFREE_ENV !== 'SANDBOX' && process.env.CASHFREE_ENV !== 'PRODUCTION') {
    errors.push('CASHFREE_ENV must be either SANDBOX or PRODUCTION')
  }

  // Application URL (Required for payment callbacks)
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    errors.push('NEXT_PUBLIC_APP_URL is not configured - payment callbacks will fail')
  }

  // Optional but recommended
  if (!process.env.SESSION_SECRET) {
    warnings.push('SESSION_SECRET is not configured - sessions may be less secure')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validates environment and logs results
 * Throws error if validation fails in production
 */
export function validateAndLogEnvironment(): void {
  const result = validateEnvironment()

  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment Configuration Warnings:')
    result.warnings.forEach(warning => console.warn(`   - ${warning}`))
  }

  if (!result.valid) {
    console.error('❌ Environment Configuration Errors:')
    result.errors.forEach(error => console.error(`   - ${error}`))
    
    // In production, fail fast
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment configuration. Application cannot start.')
    } else {
      console.error('\n⚠️  Application may not function correctly with missing environment variables.')
      console.error('   Please check .env.local and ensure all required variables are set.\n')
    }
  } else {
    console.log('✅ Environment configuration validated successfully')
  }
}

/**
 * Validates Cashfree-specific configuration
 * Used by payment routes to ensure payment processing is possible
 */
export function validateCashfreeConfig(): { valid: boolean; error?: string } {
  if (!process.env.CASHFREE_CLIENT_ID) {
    return { valid: false, error: 'CASHFREE_CLIENT_ID is not configured' }
  }
  if (!process.env.CASHFREE_CLIENT_SECRET) {
    return { valid: false, error: 'CASHFREE_CLIENT_SECRET is not configured' }
  }
  if (!process.env.CASHFREE_ENV) {
    return { valid: false, error: 'CASHFREE_ENV is not configured' }
  }
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    return { valid: false, error: 'NEXT_PUBLIC_APP_URL is not configured' }
  }
  return { valid: true }
}
