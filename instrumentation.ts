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
    const { validateAndLogEnvironment } = await import('./lib/env-validation')
    
    console.log('\n🔍 Validating environment configuration...\n')
    validateAndLogEnvironment()
    console.log('')
  }
}
