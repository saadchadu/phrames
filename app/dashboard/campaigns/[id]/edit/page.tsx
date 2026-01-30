'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import AuthGuard from '@/components/AuthGuard'
import { getCampaign, updateCampaign, generateUniqueSlug, Campaign } from '@/lib/firestore'
import { uploadImage, validateFrameImage } from '@/lib/storage'
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

  const handleSlugChange = (slug: string) => {
    // Allow only lowercase letters, numbers, and hyphens
    let sanitizedSlug = slug.toLowerCase()
    // Convert spaces to hyphens
    sanitizedSlug = sanitizedSlug.replace(/\s+/g, '-')
    // Remove invalid characters but keep hyphens
    sanitizedSlug = sanitizedSlug.replace(/[^a-z0-9-]/g, '')
    // Replace multiple consecutive hyphens with single hyphen
    sanitizedSlug = sanitizedSlug.replace(/--+/g, '-')
    setFormData(prev => ({ ...prev, slug: sanitizedSlug }))
  }

  const handleSlugBlur = () => {
    // Clean up leading/trailing hyphens only on blur
    const cleanedSlug = formData.slug.replace(/^-+|-+$/g, '')
    if (cleanedSlug !== formData.slug) {
      setFormData(prev => ({ ...prev, slug: cleanedSlug }))
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setError('Validating image...')

    try {
      // Validate frame image (checks transparency, aspect ratio, and dimensions)
      const validation = await validateFrameImage(selectedFile)
      if (!validation.valid) {
        setError(validation.error || 'Invalid file')
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

      const { error: updateError } = await updateCampaign(campaignId, updateData)

      if (updateError) {
        throw new Error(updateError)
      }

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
              className="bg-secondary hover:bg-secondary/90 text-primary px-4 py-2 rounded-md font-medium transition-colors"
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
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-primary hover:text-secondary mb-4 transition-colors text-[15px] font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-[38px] font-bold text-primary leading-tight">Edit Campaign</h1>
            <p className="text-primary/70 text-[16px] mt-2">
              Update your campaign details and frame image
            </p>
          </div>

          {/* Form */}
          <div className="bg-[#f2fff266] border border-[#00240033] rounded-2xl p-8 sm:p-10 shadow-sm">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campaign Name */}
              <div>
                <label htmlFor="campaignName" className="block text-[16px] font-semibold text-primary mb-2">
                  Campaign Name *
                </label>
                <input
                  id="campaignName"
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-[#00240033] rounded-sm text-[16px] text-primary placeholder:text-[#00240066] focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all bg-white"
                  placeholder="Enter campaign name"
                />
              </div>

              {/* URL Slug */}
              <div>
                <label htmlFor="slug" className="block text-[16px] font-semibold text-primary mb-2">
                  URL Slug *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-sm border border-r-0 border-[#00240033] bg-gray-50 text-primary/60 text-[14px]">
                    phrames.com/campaign/
                  </span>
                  <input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    onBlur={handleSlugBlur}
                    required
                    className="flex-1 px-4 py-3 border border-[#00240033] rounded-r-sm text-[16px] text-primary placeholder:text-[#00240066] focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all bg-white"
                    placeholder="campaign-slug"
                  />
                </div>
                <p className="text-[13px] text-primary/60 mt-1">Only lowercase letters, numbers, and hyphens allowed</p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-[16px] font-semibold text-primary mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-[#00240033] rounded-sm text-[16px] text-primary placeholder:text-[#00240066] focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all bg-white resize-none"
                  placeholder="Describe your campaign (optional)"
                />
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-[16px] font-semibold text-primary mb-2">
                  Visibility *
                </label>
                <div className="flex flex-col gap-3">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="Public"
                      checked={formData.visibility === 'Public'}
                      onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'Public' | 'Unlisted' }))}
                      className="mt-1 text-secondary focus:ring-secondary"
                    />
                    <div className="flex flex-col">
                      <span className="text-primary text-[16px] font-medium">Public</span>
                      <span className="text-primary/60 text-[14px]">Anyone can find and use this campaign</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="Unlisted"
                      checked={formData.visibility === 'Unlisted'}
                      onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'Public' | 'Unlisted' }))}
                      className="mt-1 text-secondary focus:ring-secondary"
                    />
                    <div className="flex flex-col">
                      <span className="text-primary text-[16px] font-medium">Unlisted</span>
                      <span className="text-primary/60 text-[14px]">Only people with the link can access</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[16px] font-semibold text-primary mb-2">
                  Status *
                </label>
                <div className="flex flex-col gap-3">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="Active"
                      checked={formData.status === 'Active'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                      className="mt-1 text-secondary focus:ring-secondary"
                    />
                    <div className="flex flex-col">
                      <span className="text-primary text-[16px] font-medium">Active</span>
                      <span className="text-primary/60 text-[14px]">Campaign is live and accessible</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="Inactive"
                      checked={formData.status === 'Inactive'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                      className="mt-1 text-secondary focus:ring-secondary"
                    />
                    <div className="flex flex-col">
                      <span className="text-primary text-[16px] font-medium">Inactive</span>
                      <span className="text-primary/60 text-[14px]">Campaign is paused</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-[16px] font-semibold text-primary mb-2">
                  Frame Image
                </label>
                <div className="border-2 border-dashed border-[#00240033] rounded-lg p-6 text-center bg-white">
                  {preview ? (
                    <div className="space-y-4">
                      <img
                        src={preview}
                        alt="Preview"
                        className="mx-auto max-h-64 rounded-lg"
                      />
                      <div className="flex gap-3 justify-center">
                        <button
                          type="button"
                          onClick={() => document.getElementById('file-upload')?.click()}
                          className="bg-secondary hover:bg-secondary/90 text-primary px-6 py-3 rounded-sm text-[16px] font-semibold transition-all"
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
                            className="border border-red-400 text-red-400 hover:bg-red-50 px-6 py-3 rounded-sm text-[16px] font-semibold transition-all"
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
                          className="bg-secondary hover:bg-secondary/90 text-primary px-6 py-3 rounded-sm text-[16px] font-semibold transition-all"
                        >
                          Upload New Frame
                        </button>
                        <p className="mt-2 text-[12px] text-primary/60">
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
              <div className="flex justify-end gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 border border-[#00240020] rounded-sm text-primary hover:bg-gray-50 text-[16px] font-medium transition-all"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-secondary text-primary rounded-sm hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-[16px]"
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