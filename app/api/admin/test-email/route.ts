import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const { to } = await request.json()

  if (!to) return NextResponse.json({ error: 'Missing to' }, { status: 400 })

  try {
    await sendEmail(to, 'Test Email from Phrames', '<h1>It works!</h1><p>Resend is configured correctly.</p>')
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, details: err }, { status: 500 })
  }
}
