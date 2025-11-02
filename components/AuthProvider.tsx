'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChange } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    try {
      const unsubscribe = onAuthStateChange((user) => {
        setUser(user)
        setLoading(false)
        setError(null)
        if (timeoutId) clearTimeout(timeoutId)
      })

      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (loading) {
          console.warn('Auth state loading timeout')
          setLoading(false)
          setError('Authentication timeout')
        }
      }, 10000) // 10 second timeout

      return () => {
        unsubscribe()
        if (timeoutId) clearTimeout(timeoutId)
      }
    } catch (err) {
      console.error('Auth initialization error:', err)
      setError('Failed to initialize authentication')
      setLoading(false)
    }
  }, [loading])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}