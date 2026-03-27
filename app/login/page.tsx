'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { signInWithEmail, signInWithGoogle } from '@/lib/auth'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import AuthGuard from '@/components/AuthGuard'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [forgotError, setForgotError] = useState('')
  const router = useRouter()

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotStatus('loading')
    setForgotError('')
    try {
      await sendPasswordResetEmail(auth, forgotEmail)
      // Send branded confirmation email via Resend (best-effort)
      fetch('/api/auth/password-reset-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      }).catch(() => {})
      setForgotStatus('sent')
    } catch (err: any) {
      setForgotStatus('error')
      setForgotError(err.code === 'auth/user-not-found' ? 'No account found with this email.' : 'Failed to send reset email. Try again.')
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { user, error: authError } = await signInWithEmail(email, password)
    
    if (authError) {
      setError(authError)
    } else if (user) {
      router.push('/dashboard')
    }
    
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    const { user, error: authError } = await signInWithGoogle()
    
    if (authError) {
      setError(authError)
    } else if (user) {
      router.push('/dashboard')
    }
    
    setLoading(false)
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-white py-8 sm:py-12 px-4">
        {/* Form Container */}
        <div className="w-full max-w-[480px] flex flex-col items-center">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 mb-6 sm:mb-8 w-full">
            <h2 className="text-primary text-2xl sm:text-3xl md:text-[38px] font-bold leading-tight text-center">
              Sign in to Phrames
            </h2>
            <p className="text-primary/70 text-sm sm:text-base font-normal leading-normal text-center max-w-md px-4">
              Welcome back! Please sign in to your account.
            </p>
          </div>
          
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl w-full">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          {/* Form Card */}
          <form onSubmit={handleEmailLogin} className="w-full bg-[#f2fff266] border border-[#00240033] rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col gap-4 shadow-sm">
            {/* Email Field */}
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="email" className="text-primary text-sm sm:text-base font-semibold">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 sm:py-3.5 border border-[#00240033] rounded-xl text-base text-primary placeholder:text-[#00240066] focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all bg-white"
              />
            </div>
            
            {/* Password Field */}
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="password" className="text-primary text-sm sm:text-base font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 sm:py-3.5 pr-12 border border-[#00240033] rounded-xl text-base text-primary placeholder:text-[#00240066] focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Forgot Password */}
            <div className="flex justify-end -mt-2">
              <button
                type="button"
                onClick={() => { setShowForgot(true); setForgotEmail(email); setForgotStatus('idle'); setForgotError('') }}
                className="text-sm text-secondary hover:text-secondary/80 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 active:scale-95 text-primary px-6 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                'Log In'
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center justify-center gap-4 w-full my-2">
              <div className="flex-1 h-px bg-[#00240020]" />
              <span className="text-[#00240099] text-xs sm:text-sm font-medium whitespace-nowrap">
                Or continue with
              </span>
              <div className="flex-1 h-px bg-[#00240020]" />
            </div>
            
            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
              className="w-full inline-flex items-center justify-center gap-3 bg-white border border-[#00240020] hover:bg-gray-50 hover:border-[#00240033] active:scale-95 text-primary px-6 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="flex items-center justify-center gap-2 w-full mt-4 sm:mt-6 px-4">
            <p className="text-sm sm:text-base text-center">
              <span className="text-primary/70">Don&apos;t have an account? </span>
              <Link href="/signup" className="text-secondary hover:text-secondary/90 font-semibold transition-colors underline-offset-2 hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 sm:p-8 flex flex-col gap-4">
            {forgotStatus === 'sent' ? (
              <>
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-primary text-lg font-bold">Check your inbox</h3>
                  <p className="text-primary/70 text-sm">We sent a password reset link to <span className="font-semibold text-primary">{forgotEmail}</span></p>
                </div>
                <button onClick={() => setShowForgot(false)} className="w-full py-3 rounded-xl bg-secondary text-primary font-semibold text-base hover:bg-secondary/90 transition-all">
                  Done
                </button>
              </>
            ) : (
              <>
                <h3 className="text-primary text-lg font-bold">Reset your password</h3>
                <p className="text-primary/70 text-sm">Enter your email and we&apos;ll send you a reset link.</p>
                {forgotStatus === 'error' && (
                  <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">{forgotError}</p>
                )}
                <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-4 py-3 border border-[#00240033] rounded-xl text-base text-primary placeholder:text-[#00240066] focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all bg-white"
                  />
                  <button
                    type="submit"
                    disabled={forgotStatus === 'loading'}
                    className="w-full py-3 rounded-xl bg-secondary text-primary font-semibold text-base hover:bg-secondary/90 transition-all disabled:opacity-50"
                  >
                    {forgotStatus === 'loading' ? 'Sending...' : 'Send reset link'}
                  </button>
                  <button type="button" onClick={() => setShowForgot(false)} className="w-full py-3 rounded-xl border border-[#00240033] text-primary/70 font-medium text-base hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </AuthGuard>
  )
}