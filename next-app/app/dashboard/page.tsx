'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { PlusIcon, PhotoIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getUserInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-25">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00dd78] mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-25">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-[#00dd78] rounded mr-2"></div>
              <h1 className="text-xl font-bold text-[#002400]">phrames</h1>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-[#00dd78] text-[#002400]">
                        {getUserInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Account</p>
                      <p className="text-xs leading-none text-gray-600">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#002400]">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your frame campaigns and track their performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Campaigns
              </CardTitle>
              <PhotoIcon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#002400]">0</div>
              <p className="text-xs text-gray-600">
                +0 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Views
              </CardTitle>
              <EyeIcon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#002400]">0</div>
              <p className="text-xs text-gray-600">
                +0 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Downloads
              </CardTitle>
              <ArrowDownTrayIcon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#002400]">0</div>
              <p className="text-xs text-gray-600">
                +0 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Campaigns
              </CardTitle>
              <div className="h-2 w-2 bg-[#00dd78] rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#002400]">0</div>
              <p className="text-xs text-gray-600">
                Currently active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <PhotoIcon className="w-8 h-8 text-gray-400" />
            </div>
            <CardTitle className="text-xl mb-2 text-[#002400]">No campaigns yet</CardTitle>
            <CardDescription className="text-center mb-6 max-w-sm">
              Get started by creating your first frame campaign. Upload your design and start sharing!
            </CardDescription>
            <Button 
              size="lg" 
              className="flex items-center gap-2 bg-[#00dd78] text-[#002400] hover:bg-[#00dd78]/90" 
              onClick={() => router.push('/dashboard/campaigns/new')}
            >
              <PlusIcon className="w-4 h-4" />
              Create your first campaign
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}