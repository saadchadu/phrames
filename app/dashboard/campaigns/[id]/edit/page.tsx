'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import AuthGuard from '@/components/AuthGuard'
import { getCampaign, updateCampaign, generateUniqueSlug, Campaign } from '@/lib/firestore'
import { uploadImage, validateImageFile, checkImageDimensions } from '@/lib/storage'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

// Prevent static generation for this auth-protected page
export const dynamic = 'force-dynamic'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function EditCampaignPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string
  
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [formData, setFormData] = useState({
    campaignName: '',
    slug: '',
    description: '',
    visibility: 'Public' as 'Public' | 'Unlisted',
    status: 'Active' as 'Active' | 'Inactive'
  })
  
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (campaignId && user) {
      loadCampaign()
    }
  }, [campaignId, user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCampaign = async () => {
    try {
      const campaignData = await getCampaign(campaignId)
      if (!campaignData) {
        setError('Campaign not found')
        return
      }
      
      // Check if user owns this campaign
      if (campaignData.createdBy !== user?.uid) {
        setError('You do not have permission to edit this campaign')
        return
      }
      
      setCampaign(campaignData)
      setFormData({
        campaignName: campaignData.campaignName,
        slug: campaignData.slug,
        description: campaignData.description || '',
        visibility: campaignData.visibility,
        status: campaignData.status
      })
      setPreview(campaignData.frameURL)
    } catch (error) {
      console.error('Error loading campaign:', error)
      setError('Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleNameChange = async (name: string) => {
    setFormData(prev => ({ ...prev, campaignName: name }))
  }

  const handleSlugChange = async (slug: string) => {
    setFormData(prev => ({ ...prev, slug }))
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
    if (!user || !campaign) return

    setSaving(true)
    setError('')

    try {
      let frameURL = campaign.frameURL

      // Upload new image if file was selected
      if (file) {
        const imagePath = `campaigns/${user.uid}/${Date.now()}-${file.name}`
        const imageUrl = await uploadImage(file, imagePath)
        
        if (!imageUrl) {
          throw new Error('Failed to upload image')
        }
        frameURL = imageUrl
      }

      // Prepare update data
      const updateData: any = {
        campaignName: formData.campaignName,
        slug: formData.slug,
        visibility: formData.visibility,
        status: formData.status,
        frameURL
      }

      // Only add description if it has content
      if (formData.description && formData.description.trim()) {
        updateData.description = formData.description.trim()
      }

      console.log('Updating campaign with data:', updateData)
      const { error: updateError } = await updateCampaign(campaignId, updateData)

      if (updateError) {
        throw new Error(updateError)
      }

      console.log('Campaign updated successfully')
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Update error:', error)
      setError(error.message || 'Failed to update campaign')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner text="Loading campaign..." />
        </div>
      </AuthGuard>
    )
  }

  if (error && !campaign) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link
              href="/dashboard"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Campaign</h1>
            <p className="text-gray-600 mt-1">
              Update your campaign details and frame image
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
                    onChange={(e) => handleSlugChange(e.target.value)}
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

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Active"
                      checked={formData.status === 'Active'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                      className="mr-2 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Active - Campaign is live and accessible</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Inactive"
                      checked={formData.status === 'Inactive'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                      className="mr-2 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Inactive - Campaign is paused</span>
                  </label>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frame Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {preview ? (
                    <div className="space-y-4">
                      <img
                        src={preview}
                        alt="Preview"
                        className="mx-auto max-h-64 rounded-lg"
                      />
                      <div className="space-x-2">
                        <button
                          type="button"
                          onClick={() => document.getElementById('file-upload')?.click()}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                        >
                          Change Image
                        </button>
                        {file && (
                          <button
                            type="button"
                            onClick={() => {
                              setFile(null)
                              setPreview(campaign?.frameURL || null)
                            }}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Cancel Changes
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => document.getElementById('file-upload')?.click()}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                        >
                          Upload New Frame
                        </button>
                        <p className="mt-1 text-xs text-gray-500">
                          PNG only, min 1080x1080px, max 10MB, transparency required
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    accept=".png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
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
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}