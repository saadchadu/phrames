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
  const [frameDimensions, setFrameDimensions] = useState<{ width: number; height: number } | null>(null)
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
      setFrameDimensions(validation.dimensions || null)
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
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start bg-white py-6 sm:py-12 px-4">
        {/* Form Container */}
        <div className="w-full max-w-[900px] flex flex-col items-center">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 mb-6 sm:mb-8 w-full">
            <Link
              href="/dashboard"
              className="self-start inline-flex items-center text-primary hover:text-secondary active:scale-95 mb-3 sm:mb-4 transition-all text-sm sm:text-base font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h2 className="text-primary text-2xl sm:text-3xl md:text-[38px] font-bold leading-tight text-center">Edit Campaign</h2>
            <p className="text-primary/70 text-sm sm:text-base font-normal leading-normal text-center max-w-md px-4">
              Update your campaign details and frame image
            </p>
          </div>

          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl w-full">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="w-full bg-[#f2fff266] border border-[#00240033] rounded-2xl p-5 sm:p-8 md:p-10 flex flex-col gap-5 sm:gap-6 shadow-sm">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Left Column - Form Fields */}
              <div className="flex flex-col gap-4 sm:gap-6">
                {/* Campaign Name */}
                <div className="flex flex-col gap-2 w-full">
                  <label htmlFor="campaignName" className="text-primary text-sm sm:text-base font-semibold">
                    Campaign Name *
                  </label>
                  <input
                    id="campaignName"
                    type="text"
                    value={formData.campaignName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    className="w-full px-4 py-3 sm:py-3.5 border border-[#00240033] rounded-xl text-base text-primary placeholder:text-[#00240066] focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all bg-white"
                    placeholder="Enter campaign name"
                  />
                </div>

                {/* URL Slug */}
                <div className="flex flex-col gap-2 w-full">
                  <label htmlFor="slug" className="text-primary text-sm sm:text-base font-semibold">
                    URL Slug *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 sm:px-4 rounded-l-xl border border-r-0 border-[#00240033] bg-gray-50 text-primary/60 text-sm sm:text-base">
                      /campaign/
                    </span>
                    <input
                      id="slug"
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      onBlur={handleSlugBlur}
                      required
                      className="flex-1 w-full px-4 py-3 sm:py-3.5 border border-[#00240033] rounded-r-xl text-base text-primary placeholder:text-[#00240066] focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all bg-white"
                      placeholder="campaign-slug"
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-primary/60">Only lowercase letters, numbers, and hyphens allowed</p>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2 w-full">
                  <label htmlFor="description" className="text-primary text-sm sm:text-base font-semibold">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 sm:py-3.5 border border-[#00240033] rounded-xl text-base text-primary placeholder:text-[#00240066] focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all bg-white resize-none"
                    placeholder="Describe your campaign (optional)"
                  />
                </div>

                {/* Visibility */}
                <div className="flex flex-col gap-2 w-full">
                  <label className="text-primary text-sm sm:text-base font-semibold">Visibility</label>
                  <div className="flex gap-3">
                    {(['Public', 'Unlisted'] as const).map((v) => (
                      <label
                        key={v}
                        className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-3 rounded-xl border transition-all ${formData.visibility === v
                          ? 'border-secondary bg-secondary/10 text-primary font-semibold'
                          : 'border-[#00240020] bg-white text-primary/60 hover:bg-gray-50'
                          }`}
                      >
                        <input
                          type="radio"
                          value={v}
                          checked={formData.visibility === v}
                          onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'Public' | 'Unlisted' }))}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{v}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-2 w-full">
                  <label className="text-primary text-sm sm:text-base font-semibold">Status</label>
                  {campaign && !campaign.isActive ? (
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
                      <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                      </svg>
                      <div>
                        <p className="text-amber-800 text-sm font-medium">Payment required to activate</p>
                        <p className="text-amber-700 text-xs mt-0.5">Go to your <Link href="/dashboard" className="underline font-medium">Dashboard</Link> to renew your plan.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      {(['Active', 'Inactive'] as const).map((s) => (
                        <label
                          key={s}
                          className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-3 rounded-xl border transition-all ${formData.status === s
                            ? s === 'Active'
                              ? 'border-secondary bg-secondary/10 text-primary font-semibold'
                              : 'border-red-300 bg-red-50 text-red-700 font-semibold'
                            : 'border-[#00240020] bg-white text-primary/60 hover:bg-gray-50'
                            }`}
                        >
                          <input
                            type="radio"
                            value={s}
                            checked={formData.status === s}
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">{s}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

              </div> {/* End Left Column */}

              {/* Right Column - File Upload */}
              <div className="flex flex-col gap-2 w-full">
                <label className="text-primary text-sm sm:text-base font-semibold">
                  Frame Image
                </label>
                <div className="border-2 border-dashed border-[#00240033] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-4 bg-white min-h-[300px] sm:min-h-[400px]">
                  {preview ? (
                    <div className="flex flex-col items-center gap-4 w-full">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-48 sm:max-h-64 rounded-xl shadow-md"
                      />
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4">
                        <label className="cursor-pointer flex-1 sm:flex-initial">
                          <span className="inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 active:scale-95 text-primary px-5 sm:px-6 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all w-full leading-none">
                            Change Image
                          </span>
                          <input
                            type="file"
                            accept=".png"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        {file && (
                          <button
                            type="button"
                            onClick={() => {
                              setFile(null)
                              setPreview(campaign?.frameURL || null)
                            }}
                            className="inline-flex items-center justify-center gap-2.5 border border-red-400 text-red-400 hover:bg-red-50 active:scale-95 px-5 sm:px-6 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all w-full sm:w-auto"
                          >
                            Cancel Changes
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 sm:gap-5">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-4 flex flex-col items-center">
                        <label className="cursor-pointer w-full sm:w-auto">
                          <span className="inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 active:scale-95 text-primary px-5 sm:px-6 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all w-full leading-none">
                            Upload New Frame
                          </span>
                          <input
                            type="file"
                            accept=".png"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs sm:text-sm text-primary/60 px-2 leading-relaxed text-center lg:text-left">
                  PNG format • Transparency required • Supported aspect ratios: 1:1, 4:5, 3:4, 9:16 • Min 1080px wide • Max 10MB
                </p>
                {file && frameDimensions && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-700 text-sm font-medium">
                      {frameDimensions.width} × {frameDimensions.height}px
                    </span>
                  </div>
                )}
              </div>
            </div>


            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 active:scale-95 text-primary px-6 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}