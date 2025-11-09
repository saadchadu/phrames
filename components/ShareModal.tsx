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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Share Campaign</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Share <strong>{campaignName}</strong> with others so they can add this frame to their photos.
          </p>
          
          <div className="flex items-center space-x-2 p-3 bg-background rounded-lg">
            <input
              type="text"
              value={campaignUrl}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1 bg-secondary text-primary rounded text-sm hover:bg-secondary/90 transition-colors"
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

        <div className="flex space-x-3">
          {canShare && (
            <button
              onClick={handleShare}
              className="flex-1 bg-secondary hover:bg-secondary/90 text-primary px-4 py-2 rounded-md font-medium transition-colors"
            >
              Share
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}