import { NextRequest, NextResponse } from 'next/server'
import { sendPasswordResetConfirmationEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  // Rate limit: 5 requests per 15 minutes per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown'
  if (!checkRateLimit(ip, { name: 'password-reset', limit: 5, windowMs: 15 * 60 * 1000 })) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const email: string = body.email
    const userName: string = body.userName || 'there'

    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 })
    }

    await sendPasswordResetConfirmationEmail(email, { userName })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true })
  }
}
