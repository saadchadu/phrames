'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import AuthGuard from '@/components/AuthGuard'
import { createCampaign, generateUniqueSlug } from '@/lib/firestore'
import { uploadImage, validateImageFile, checkImageDimensions } from '@/lib/storage'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

// Prevent static generation for this auth-protected page
export const dynamic = 'force-dynamic'

export default function CreateCampaignPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    campaignName: '',
    slug: '',
    description: '',
    visibility: 'Public' as 'Public' | 'Unlisted'
  })
  
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleNameChange = async (name: string) => {
    setFormData(prev => ({ ...prev, campaignName: name }))
    
    if (name && !formData.slug) {
      // Auto-generate slug from name
      const baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      if (baseSlug) {
        try {
          const uniqueSlug = await generateUniqueSlug(baseSlug)
          setFormData(prev => ({ ...prev, slug: uniqueSlug }))
        } catch (error) {
          console.error('Error generating slug:', error)
        }
      }
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file
    const validation = validateImageFile(selectedFile)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    try {
      // Check dimensions
      const dimensions = await checkImageDimensions(selectedFile)
      if (dimensions.width < 1080 || dimensions.height < 1080) {
        setError('Image must be at least 1080x1080 pixels')
        return
      }

      setFile(selectedFile)
      setError('')
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      setError('Error processing image')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !file) return

    setLoading(true)
    setError('')

    try {
      // Upload image to Firebase Storage
      const imagePath = `campaigns/${user.uid}/${Date.now()}-${file.name}`
      const imageUrl = await uploadImage(file, imagePath)
      
      if (!imageUrl) {
        throw new Error('Failed to upload image')
      }

      // Create campaign in Firestore
      const campaignPayload: any = {
        campaignName: formData.campaignName,
        slug: formData.slug,
        visibility: formData.visibility,
        frameURL: imageUrl,
        status: 'Active',
        createdBy: user.uid
      }
      
      // Only add description if it has content
      if (formData.description && formData.description.trim()) {
        campaignPayload.description = formData.description.trim()
      }
      
      console.log('Creating campaign with payload:', campaignPayload)
      const { id, error: createError } = await createCampaign(campaignPayload)

      if (createError) {
        console.error('Campaign creation error:', createError)
        throw new Error(createError)
      }

      console.log('Campaign created successfully with ID:', id)
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
            <p className="text-gray-600 mt-1">
              Upload your frame and set up your campaign details
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campaign Name */}
              <div>
                <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  id="campaignName"
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter campaign name"
                />
              </div>

              {/* URL Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    phrames.com/c/
                  </span>
                  <input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="campaign-slug"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Describe your campaign (optional)"
                />
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Public"
                      checked={formData.visibility === 'Public'}
                      onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'Public' | 'Unlisted' }))}
                      className="mr-2 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Public - Anyone can find and use this frame</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Unlisted"
                      checked={formData.visibility === 'Unlisted'}
                      onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'Public' | 'Unlisted' }))}
                      className="mr-2 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Unlisted - Only people with the link can access</span>
                  </label>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frame Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {preview ? (
                    <div className="space-y-4">
                      <img
                        src={preview}
                        alt="Preview"
                        className="mx-auto max-h-64 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null)
                          setPreview(null)
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-4">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload PNG frame
                          </span>
                          <input
                            id="file-upload"
                            type="file"
                            accept=".png"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="mt-1 text-xs text-gray-500">
                          PNG only, min 1080x1080px, max 10MB, transparency required
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link
                  href="/dashboard"
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}