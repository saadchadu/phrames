/**
 * Next.js Instrumentation
 * 
 * This file runs once when the Next.js server starts.
 * It's used for initialization tasks like environment validation.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnvironment } = await import('./lib/env-validation')
    
    console.log('\n🔍 Validating environment configuration...\n')
    const result = validateEnvironment()
    
    if (result.warnings.length > 0) {
      console.warn('⚠️  Environment Configuration Warnings:')
      result.warnings.forEach(warning => console.warn(`   - ${warning}`))
    }
    
    if (!result.valid) {
      console.error('❌ Environment Configuration Errors:')
      result.errors.forEach(error => console.error(`   - ${error}`))
      console.error('\n⚠️  Some environment variables are missing. Application may not function correctly.\n')
      // Don't throw in production - let it start anyway
    } else {
      console.log('✅ Environment configuration validated successfully\n')
    }
  }
}
