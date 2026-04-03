import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const decoded = await adminAuth.verifyIdToken(auth.split('Bearer ')[1]);
    if (decoded.isAdmin !== true) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { to } = await request.json()
  if (!to) return NextResponse.json({ error: 'Missing to' }, { status: 400 })

  try {
    await sendEmail(to, 'Test Email from Phrames', '<h1>It works!</h1><p>Resend is configured correctly.</p>')
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Test email error:', err)
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 })
  }
}
