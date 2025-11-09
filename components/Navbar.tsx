'use client'

import Link from 'next/link'
import Image from 'next/image'
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
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logos/Logo-black.svg"
                alt="Phrames"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">{user.email}</span>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-secondary hover:bg-secondary/90 text-primary px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="bg-secondary hover:bg-secondary/90 text-primary px-4 py-2 rounded-md text-sm font-medium transition-colors"
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