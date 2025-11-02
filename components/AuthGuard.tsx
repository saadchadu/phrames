'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'
import LoadingSpinner from './LoadingSpinner'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading, error } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!loading && !error) {
      if (requireAuth && !user) {
        setRedirecting(true)
        router.push('/login')
      } else if (!requireAuth && user) {
        setRedirecting(true)
        router.push('/dashboard')
      }
    }
  }, [user, loading, error, requireAuth, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Loading..." />
      </div>
    )
  }

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Redirecting..." />
      </div>
    )
  }

  if (requireAuth && !user) {
    return null
  }

  if (!requireAuth && user) {
    return null
  }

  return <>{children}</>
}