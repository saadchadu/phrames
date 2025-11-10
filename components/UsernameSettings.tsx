'use client'

import { useState } from 'react'
import { validateUsername, isUsernameUnique, updateUserProfile } from '@/lib/auth'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface UsernameSettingsProps {
  currentUsername?: string
  userId: string
  onUpdate?: () => void
}

export default function UsernameSettings({ currentUsername, userId, onUpdate }: UsernameSettingsProps) {
  const [username, setUsername] = useState(currentUsername || '')
  const [checking, setChecking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  const handleUsernameChange = (value: string) => {
    setUsername(value.toLowerCase())
    setError('')
    setSuccess(false)
    setIsAvailable(null)
  }

  const checkAvailability = async () => {
    if (!username || username === currentUsername) {
      setIsAvailable(null)
      return
    }

    const validation = validateUsername(username)
    if (!validation.valid) {
      setError(validation.error || 'Invalid username')
      setIsAvailable(false)
      return
    }

    setChecking(true)
    setError('')
    
    try {
      const available = await isUsernameUnique(username, userId)
      setIsAvailable(available)
      if (!available) {
        setError('Username is already taken')
      }
    } catch (error) {
      setError('Error checking username availability')
      setIsAvailable(false)
    } finally {
      setChecking(false)
    }
  }

  const handleSave = async () => {
    if (!username || username === currentUsername) {
      return
    }

    const validation = validateUsername(username)
    if (!validation.valid) {
      setError(validation.error || 'Invalid username')
      return
    }

    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const available = await isUsernameUnique(username, userId)
      if (!available) {
        setError('Username is already taken')
        setSaving(false)
        return
      }

      const { error: updateError } = await updateUserProfile(userId, { username: username.toLowerCase() })
      
      if (updateError) {
        setError(updateError)
      } else {
        setSuccess(true)
        if (onUpdate) {
          onUpdate()
        }
      }
    } catch (error) {
      setError('Failed to update username')
    } finally {
      setSaving(false)
    }
  }

  const hasChanged = username !== currentUsername && username.length > 0

  return (
    <div className="bg-white border border-[#00240010] rounded-2xl p-6 sm:p-8 shadow-sm">
      <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">Username</h3>
      <p className="text-primary/60 text-sm sm:text-base mb-6">
        Your unique username for your public profile
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-primary mb-2">
            Username
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#00240020] bg-gray-50 text-primary/60 text-sm">
                  @
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  onBlur={checkAvailability}
                  className="flex-1 px-4 py-3 border border-[#00240020] rounded-r-xl text-base text-primary placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                  placeholder="your-username"
                  disabled={saving}
                />
              </div>
              {checking && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-secondary"></div>
                </div>
              )}
              {!checking && isAvailable === true && hasChanged && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
              )}
              {!checking && isAvailable === false && hasChanged && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={!hasChanged || saving || isAvailable === false || checking}
              className="px-6 py-3 bg-secondary hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary rounded-xl font-semibold transition-all"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          <p className="text-xs text-primary/50 mt-2">
            3-30 characters, letters, numbers, hyphens, and underscores only
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-600 text-sm">Username updated successfully!</p>
          </div>
        )}

        {currentUsername && (
          <div className="pt-4 border-t border-[#00240010]">
            <p className="text-sm text-primary/60 mb-2">Your profile URL:</p>
            <a
              href={`/user/${currentUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:underline text-sm font-medium"
            >
              phrames.cleffon.com/user/{currentUsername}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
