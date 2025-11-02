'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-green-600">
              Phrames
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">{user.email}</span>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}