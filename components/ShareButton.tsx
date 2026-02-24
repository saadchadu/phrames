'use client'

import { useState } from 'react'
import { ShareIcon, CheckIcon } from '@heroicons/react/24/outline'
import { toast } from './ui/toaster'

interface ShareButtonProps {
  url: string
  title: string
  text?: string
  className?: string
}

export default function ShareButton({ url, title, text, className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url
        })
        return
      } catch (error) {
        // User cancelled or error - fall through to clipboard
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error)
        }
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast('Profile link copied to clipboard!', 'success')
      
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
      toast('Failed to copy link', 'error')
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-primary border border-[#00240020] rounded-xl font-medium transition-all ${className}`}
    >
      {copied ? (
        <>
          <CheckIcon className="w-5 h-5 text-green-500" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <ShareIcon className="w-5 h-5" />
          <span>Share Profile</span>
        </>
      )}
    </button>
  )
}
