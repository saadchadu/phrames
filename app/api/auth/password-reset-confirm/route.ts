import { NextRequest, NextResponse } from 'next/server'
import { sendPasswordResetConfirmationEmail } from '@/lib/email'

// Called client-side after Firebase sendPasswordResetEmail succeeds
// to send a branded confirmation email via Resend
export async function POST(req: NextRequest) {
  try {
    const { email, userName } = await req.json()
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

    await sendPasswordResetConfirmationEmail(email, { userName: userName || 'there' })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[password-reset-confirm]', err)
    // Don't expose errors — always return success to avoid email enumeration
    return NextResponse.json({ success: true })
  }
}
