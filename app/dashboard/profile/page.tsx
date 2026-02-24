'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import AuthGuard from '@/components/AuthGuard'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { uploadImage, deleteImage } from '@/lib/storage'
import { compressImage, validateProfileImage } from '@/lib/image-compression'
import { User } from '@/lib/firestore'
import { toast } from '@/components/ui/toaster'
import { 
  UserCircleIcon, 
  PhotoIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner'

export const dynamic = 'force-dynamic'

export default function ProfileEditPage() {
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    profileImageUrl: '',
    googlePhotoURL: '',
    location: '',
    website: ''
  })

  const [originalUsername, setOriginalUsername] = useState('')

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data() as User
        
        setFormData({
          displayName: userData.displayName || user.displayName || '',
          username: userData.username || '',
          bio: userData.bio || '',
          profileImageUrl: userData.profileImageUrl || '',
          googlePhotoURL: userData.googlePhotoURL || user.photoURL || '',
          location: userData.location || '',
          website: userData.website || ''
        })
        setOriginalUsername(userData.username || '')
      } else {
        // New user - populate with Google data if available
        setFormData({
          displayName: user.displayName || '',
          username: '',
          bio: '',
          profileImageUrl: '',
          googlePhotoURL: user.photoURL || '',
          location: '',
          website: ''
        })
      }
    } catch (error) {
      toast('Error loading profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username === originalUsername) {
      setUsernameAvailable(null)
      return
    }

    // Validate format
    const usernameRegex = /^[a-z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      setUsernameAvailable(false)
      return
    }

    setCheckingUsername(true)
    try {
      const response = await fetch('/api/profile/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, currentUid: user?.uid })
      })

      const data = await response.json()
      setUsernameAvailable(data.available)
    } catch (error) {
      setUsernameAvailable(null)
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleUsernameChange = (value: string) => {
    const lowercase = value.toLowerCase()
    setFormData(prev => ({ ...prev, username: lowercase }))
    
    // Debounce username check
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(lowercase)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file
    const validation = validateProfileImage(file)
    if (!validation.valid) {
      toast(validation.error || 'Invalid image file', 'error')
      return
    }

    setUploading(true)
    try {
      // Compress image to WebP format
      toast('Compressing image...', 'info')
      const compressedFile = await compressImage(file)
      
      // Check final size
      const finalSizeKB = Math.round(compressedFile.size / 1024)
      
      if (finalSizeKB > 500) {
        console.warn(`Compressed image size: ${finalSizeKB}KB (target: 300KB)`)
      }

      // Use consistent path: profile-images/{uid}.webp
      const path = `profile-images/${user.uid}.webp`
      const url = await uploadImage(compressedFile, path)
      
      if (url) {
        setFormData(prev => ({ ...prev, profileImageUrl: url }))
        toast(`Image uploaded successfully (${finalSizeKB}KB)`, 'success')
      } else {
        throw new Error('Upload failed - no URL returned')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error uploading image'
      toast(errorMessage, 'error')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validate username
    if (formData.username && formData.username !== originalUsername) {
      if (usernameAvailable === false) {
        toast('Username is not available', 'error')
        return
      }
    }

    // Validate website URL
    if (formData.website && formData.website.trim()) {
      try {
        new URL(formData.website)
      } catch {
        toast('Please enter a valid website URL', 'error')
        return
      }
    }

    setSaving(true)
    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast('Profile updated successfully', 'success')
        setOriginalUsername(formData.username)
        
        // Redirect to profile if username is set
        if (formData.username) {
          setTimeout(() => {
            router.push(`/user/${formData.username}`)
          }, 1500)
        }
      } else {
        toast(data.error || 'Error updating profile', 'error')
      }
    } catch (error) {
      toast('Error updating profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="Loading profile..." />
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1">Edit Profile</h1>
            <p className="text-sm text-primary/60">Manage your public creator profile</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section 1: Profile Image & Basic Info */}
              <div className="bg-white border border-primary/10 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-primary mb-6">Profile Image</h2>
                
                {/* Profile Image */}
                <div className="mb-6">
                  <div className="flex flex-col items-center gap-4">
                    {/* Display current image based on priority */}
                    {(formData.profileImageUrl || formData.googlePhotoURL) ? (
                      <img
                        src={
                          (formData.profileImageUrl || formData.googlePhotoURL).includes('googleusercontent.com')
                            ? `/api/image-proxy?url=${encodeURIComponent(formData.profileImageUrl || formData.googlePhotoURL)}`
                            : (formData.profileImageUrl || formData.googlePhotoURL)
                        }
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-secondary/20"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const fallback = target.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    {!(formData.profileImageUrl || formData.googlePhotoURL) && (
                      <div className="w-32 h-32 rounded-full bg-secondary/20 flex items-center justify-center border-4 border-secondary/20">
                        <UserCircleIcon className="w-16 h-16 text-primary/40" />
                      </div>
                    )}
                    {/* Hidden fallback */}
                    {(formData.profileImageUrl || formData.googlePhotoURL) && (
                      <div className="w-32 h-32 rounded-full bg-secondary/20 items-center justify-center border-4 border-secondary/20 hidden">
                        <UserCircleIcon className="w-16 h-16 text-primary/40" />
                      </div>
                    )}
                    
                    <div className="text-center w-full">
                      <div className="flex flex-col gap-2">
                        {/* Upload/Change Image Button */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/90 text-primary rounded-lg font-medium transition-all disabled:opacity-50"
                        >
                          <PhotoIcon className="w-5 h-5" />
                          {uploading ? 'Uploading...' : formData.profileImageUrl ? 'Change Image' : 'Upload Image'}
                        </button>
                        
                        {/* Remove Custom Image Button - only show if custom image exists */}
                        {formData.profileImageUrl && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (!user) return
                              
                              // Delete from Firebase Storage
                              const path = `profile-images/${user.uid}.webp`
                              const deleted = await deleteImage(path)
                              
                              if (deleted) {
                                setFormData(prev => ({ ...prev, profileImageUrl: '' }))
                                toast('Custom image removed. Google photo will be used.', 'success')
                              } else {
                                // Still remove from UI even if storage deletion fails
                                setFormData(prev => ({ ...prev, profileImageUrl: '' }))
                                toast('Custom image removed from profile.', 'success')
                              }
                            }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-red-600 border border-red-200 rounded-lg font-medium transition-all text-sm"
                          >
                            Remove Custom Image
                          </button>
                        )}
                      </div>
                      
                      <p className="text-xs text-primary/60 mt-3">
                        JPG, PNG, or WEBP. Max 5MB.
                      </p>
                      
                      {/* Show current image source */}
                      {formData.profileImageUrl && (
                        <p className="text-xs text-secondary mt-2">
                          ✓ Using custom uploaded image
                        </p>
                      )}
                      {!formData.profileImageUrl && formData.googlePhotoURL && (
                        <p className="text-xs text-blue-600 mt-2">
                          ✓ Using Google profile photo
                        </p>
                      )}
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Display Name */}
                <div className="mb-4">
                  <label htmlFor="displayName" className="block text-sm font-semibold text-primary mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#00240020] rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-primary placeholder:text-primary/40"
                    placeholder="Your name"
                  />
                </div>

                {/* Username */}
                <div className="mb-0">
                  <label htmlFor="username" className="block text-sm font-semibold text-primary mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-primary/60 font-medium">@</span>
                    </div>
                    <input
                      type="text"
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className="w-full pl-8 pr-12 py-2.5 border border-[#00240020] rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-primary placeholder:text-primary/40"
                      placeholder="username"
                      pattern="[a-z0-9_]{3,20}"
                    />
                    {checkingUsername && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-secondary"></div>
                      </div>
                    )}
                    {!checkingUsername && usernameAvailable !== null && formData.username !== originalUsername && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        {usernameAvailable ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-primary/60 mt-1">
                    3-20 characters, lowercase letters, numbers, and underscores only
                  </p>
                  {!checkingUsername && usernameAvailable === false && formData.username !== originalUsername && (
                    <p className="text-xs text-red-500 mt-1">Username is already taken</p>
                  )}
                </div>
              </div>

              {/* Section 2: Additional Details */}
              <div className="bg-white border border-primary/10 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-primary mb-6">Additional Details</h2>

                {/* Bio */}
                <div className="mb-4">
                  <label htmlFor="bio" className="block text-sm font-semibold text-primary mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    maxLength={200}
                    className="w-full px-4 py-2.5 border border-[#00240020] rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent resize-none text-primary placeholder:text-primary/40"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="text-xs text-primary/60 mt-1">
                    {formData.bio.length}/200 characters
                  </p>
                </div>

                {/* Location */}
                <div className="mb-4">
                  <label htmlFor="location" className="block text-sm font-semibold text-primary mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#00240020] rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-primary placeholder:text-primary/40"
                    placeholder="City, Country"
                  />
                </div>

                {/* Website */}
                <div className="mb-6">
                  <label htmlFor="website" className="block text-sm font-semibold text-primary mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#00240020] rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-primary placeholder:text-primary/40"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                {/* Preview Link */}
                {formData.username && (
                  <div className="pt-4 border-t border-[#00240010]">
                    <p className="text-xs text-primary/60 mb-2">Your public profile:</p>
                    <a
                      href={`/user/${formData.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-secondary hover:underline font-medium break-all"
                    >
                      phrames.cleffon.com/user/{formData.username}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Actions - Full Width Below */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                type="submit"
                disabled={saving || uploading || (formData.username !== originalUsername && usernameAvailable === false)}
                className="flex-1 bg-secondary hover:bg-secondary/90 text-primary px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-white hover:bg-gray-50 text-primary border border-[#00240020] px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}
