import { NextResponse } from 'next/server'
import { validateCashfreeConfig } from '@/lib/env-validation'

export async function GET() {
  try {
    const configCheck = validateCashfreeConfig()
    
    return NextResponse.json({
      valid: configCheck.valid,
      error: configCheck.error,
      env: {
        hasClientId: !!process.env.CASHFREE_CLIENT_ID,
        hasClientSecret: !!process.env.CASHFREE_CLIENT_SECRET,
        cashfreeEnv: process.env.CASHFREE_ENV,
        hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
        clientIdLength: process.env.CASHFREE_CLIENT_ID?.length || 0,
        clientSecretLength: process.env.CASHFREE_CLIENT_SECRET?.length || 0
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
