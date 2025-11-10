'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  campaignName: string
  campaignUrl: string
}

export default function ShareModal({ isOpen, onClose, campaignName, campaignUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && 'share' in navigator)
  }, [])

  if (!isOpen) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(campaignUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleShare = async () => {
    if (canShare) {
      try {
        await navigator.share({
          title: campaignName,
          text: `Check out this frame campaign: ${campaignName}`,
          url: campaignUrl
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-6 sm:p-8 animate-slide-up sm:animate-none shadow-2xl">
        <div className="flex justify-between items-center mb-5 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Share Campaign</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 active:scale-95 transition-all p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6 sm:mb-8">
          <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-5">
            Share <strong>{campaignName}</strong> with others so they can add this frame to their photos.
          </p>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
            <input
              type="text"
              value={campaignUrl}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none min-w-0 truncate"
            />
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-secondary text-primary rounded-lg text-sm font-semibold hover:bg-secondary/90 active:scale-95 transition-all shadow-sm whitespace-nowrap"
            >
              {copied ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardIcon className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {canShare && (
            <button
              onClick={handleShare}
              className="flex-1 bg-secondary hover:bg-secondary/90 active:scale-95 text-primary px-5 py-3 sm:py-3.5 rounded-xl font-semibold transition-all shadow-sm"
            >
              Share
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 active:scale-95 text-gray-800 px-5 py-3 sm:py-3.5 rounded-xl font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}