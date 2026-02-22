'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from './AuthProvider'
import { logout } from '@/lib/auth'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if user is admin by checking custom claims
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          // Get the ID token result which includes custom claims
          const idTokenResult = await user.getIdTokenResult()
          setIsAdmin(idTokenResult.claims.isAdmin === true)
        } catch (error) {
          console.error('Error checking admin status:', error)
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
    }
    
    checkAdminStatus()
  }, [user])

  const handleSignOut = async () => {
    await logout()
    setMobileMenuOpen(false)
    router.push('/login')
  }

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logos/Logo-black.svg"
                alt="Phrames"
                width={100}
                height={28}
                className="h-6 sm:h-8 w-auto"
                priority
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {user ? (
              <>
                <span className="text-gray-700 text-sm truncate max-w-[150px] lg:max-w-none">{user.email}</span>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-gray-700 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Admin
                  </Link>
                )}
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-secondary hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-2 text-sm text-gray-700 border-b border-gray-100 mb-2">
                  {user.email}
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                    pathname === '/dashboard'
                      ? 'bg-secondary/10 text-secondary'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                    pathname === '/create'
                      ? 'bg-secondary/10 text-secondary'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Create Campaign
                </Link>
                <Link
                  href="/dashboard/payments"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                    pathname.startsWith('/dashboard/payments')
                      ? 'bg-secondary/10 text-secondary'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Payments
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                      pathname.startsWith('/admin')
                        ? 'bg-secondary/10 text-secondary'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-3 rounded-lg text-base font-medium bg-secondary text-primary hover:bg-secondary/90 transition-colors text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}