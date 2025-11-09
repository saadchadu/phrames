'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithEmail, signInWithGoogle } from '@/lib/auth'
import AuthGuard from '@/components/AuthGuard'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-white py-12 px-4">
        {/* Form Container */}
        <div className="w-full max-w-[480px] flex flex-col items-center">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 mb-8 w-full">
            <h2 className="text-primary text-[36px] font-bold leading-tight text-center">
              Sign in to Phrames
            </h2>
            <p className="text-primary/70 text-[16px] font-normal leading-[24px] text-center max-w-md">
              Welcome back! Please sign in to your account.
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm w-full">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          {/* Form Card */}
          <form onSubmit={handleEmailLogin} className="w-full bg-[#f2fff266] border border-[#00240033] rounded-2xl p-8 sm:p-10 flex flex-col gap-4 shadow-sm">
            {/* Email Field */}
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="email" className="text-primary text-[15px] font-semibold">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#00240033] rounded-sm text-[15px] placeholder:text-[#00240066] focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all bg-white"
              />
            </div>
            
            {/* Password Field */}
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="password" className="text-primary text-[15px] font-semibold">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#00240033] rounded-sm text-[15px] placeholder:text-[#00240066] focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all bg-white"
              />
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 text-primary px-6 py-3.5 rounded-sm text-[16px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm hover:shadow-md"
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
              <span className="text-[#00240099] text-[13px] font-medium whitespace-nowrap">
                Or continue with
              </span>
              <div className="flex-1 h-px bg-[#00240020]" />
            </div>
            
            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
              className="w-full inline-flex items-center justify-center gap-3 bg-white border border-[#00240020] hover:bg-gray-50 hover:border-[#00240033] text-primary px-6 py-3.5 rounded-sm text-[15px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
          <div className="flex items-center justify-center gap-2 w-full mt-6">
            <p className="text-[14px] text-center">
              <span className="text-primary/70">Don&apos;t have an account? </span>
              <Link href="/signup" className="text-secondary hover:text-secondary/90 font-semibold transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}