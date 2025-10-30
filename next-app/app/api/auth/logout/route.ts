import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = cookies().get('session-token')?.value

    if (sessionToken) {
      // Delete session from database
      await deleteSession(sessionToken)
    }

    // Clear session cookie
    cookies().delete('session-token')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}