import { NextRequest, NextResponse } from 'next/server'
import { sendPasswordResetConfirmationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
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
