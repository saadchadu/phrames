import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { firestoreHelpers } from '@/lib/firestore'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get('session-id')?.value

    if (sessionId) {
      // Delete session from database
      await firestoreHelpers.deleteSession(sessionId)
    }

    // Clear session cookie
    cookieStore.delete('session-id')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}