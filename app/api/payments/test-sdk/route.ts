import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Try to import and initialize Cashfree
    const { Cashfree, CFEnvironment } = await import('cashfree-pg')
    
    const environment = process.env.CASHFREE_ENV === 'PRODUCTION' 
      ? CFEnvironment.PRODUCTION 
      : CFEnvironment.SANDBOX
    
    const cashfree = new Cashfree(
      environment,
      process.env.CASHFREE_CLIENT_ID!,
      process.env.CASHFREE_CLIENT_SECRET!
    )
    
    return NextResponse.json({
      success: true,
      message: 'Cashfree SDK initialized successfully',
      environment: process.env.CASHFREE_ENV
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      name: error.name
    }, { status: 500 })
  }
}
