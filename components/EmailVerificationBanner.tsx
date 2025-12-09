'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { sendEmailVerification } from 'firebase/auth'
import { XMarkIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

export default function EmailVerificationBanner() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  // Don't show if user is verified, not logged in, or dismissed
  if (!user || user.emailVerified || dismissed) {
    return null
  }

  const handleResendVerification = async () => {
    if (!user || sending) return

    try {
      setSending(true)
      await sendEmailVerification(user)
      setSent(true)
      setTimeout(() => setSent(false), 5000)
    } catch (error) {
      console.error('Failed to send verification email:', error)
      alert('Failed to send verification email. Please try again later.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-1">
            <EnvelopeIcon className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Please verify your email address.</span>
                {' '}Check your inbox for a verification link.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sent ? (
              <span className="text-sm text-green-600 font-medium">
                ✓ Verification email sent!
              </span>
            ) : (
              <button
                onClick={handleResendVerification}
                disabled={sending}
                className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Resend Email'}
              </button>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="text-yellow-600 hover:text-yellow-800 p-1"
              aria-label="Dismiss"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
