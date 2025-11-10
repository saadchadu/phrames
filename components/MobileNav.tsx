'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, PlusCircleIcon, RectangleStackIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { HomeIcon as HomeIconSolid, PlusCircleIcon as PlusCircleIconSolid, RectangleStackIcon as RectangleStackIconSolid, UserCircleIcon as UserCircleIconSolid } from '@heroicons/react/24/solid'
import { useAuth } from './AuthProvider'

export default function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Don't show on auth pages
  if (pathname === '/login' || pathname === '/signup') {
    return null
  }

  const navItems = [
    { href: '/', label: 'Home', icon: HomeIcon, iconSolid: HomeIconSolid },
    ...(user ? [
      { href: '/create', label: 'Create', icon: PlusCircleIcon, iconSolid: PlusCircleIconSolid },
      { href: '/dashboard', label: 'Campaigns', icon: RectangleStackIcon, iconSolid: RectangleStackIconSolid },
    ] : []),
    { href: user ? '/dashboard' : '/login', label: user ? 'Profile' : 'Login', icon: UserCircleIcon, iconSolid: UserCircleIconSolid },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#00240010] z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = isActive ? item.iconSolid : item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-primary bg-secondary/10' 
                  : 'text-primary/60 hover:text-primary hover:bg-[#00240005]'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
