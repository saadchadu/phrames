'use client'

import { getDisplayImageUrl, getInitials, getAvatarGradient, UserAvatarData } from '@/lib/avatar'
import { useState } from 'react'
import Image from 'next/image'

interface AvatarProps {
  user: UserAvatarData
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  showBorder?: boolean
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-24 h-24 text-3xl',
  xl: 'w-32 h-32 text-5xl',
  '2xl': 'w-40 h-40 text-6xl'
}

const sizePixels = {
  sm: 32,
  md: 48,
  lg: 96,
  xl: 128,
  '2xl': 160
}

export default function Avatar({ user, size = 'md', className = '', showBorder = false }: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = getDisplayImageUrl(user)
  const initials = getInitials(user)
  const gradient = getAvatarGradient(user)
  
  const borderClass = showBorder ? 'border-4 border-secondary/20' : ''
  const sizeClass = sizeClasses[size]
  const pixelSize = sizePixels[size]

  // Show fallback if no image or image failed to load
  if (!imageUrl || imageError) {
    return (
      <div
        className={`${sizeClass} ${borderClass} ${className} rounded-full flex items-center justify-center font-bold text-white`}
        style={{ background: gradient }}
        role="img"
        aria-label={`${user.displayName || user.username || 'User'} avatar`}
      >
        {initials}
      </div>
    )
  }

  return (
    <div className={`${sizeClass} ${borderClass} ${className} rounded-full overflow-hidden relative`}>
      <Image
        src={imageUrl}
        alt={`${user.displayName || user.username || 'User'} profile picture`}
        width={pixelSize}
        height={pixelSize}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
        loading="lazy"
        unoptimized={imageUrl.includes('googleusercontent.com')}
        priority={size === 'xl'}
      />
    </div>
  )
}
