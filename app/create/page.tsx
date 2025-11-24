'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import AuthGuard from '@/components/AuthGuard'
import PaymentModal from '@/components/PaymentModal'
import { createCampaign, generateUniqueSlug, checkFreeCampaignEligibility, activateFreeCampaign } from '@/lib/firestore'
import { uploadImage, validateFrameImage } from '@/lib/storage'
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
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null)

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
        createdBy: user.uid,
        createdByEmail: user.email
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
      
      // Check if user is eligible for free campaign
      const isEligibleForFree = await checkFreeCampaignEligibility(user.uid)
      
      if (isEligibleForFree) {
        // Activate as free campaign
        console.log('User eligible for free campaign, activating...')
        const { error: activationError } = await activateFreeCampaign(id!, user.uid)
        
        if (activationError) {
          console.error('Free campaign activation error:', activationError)
          throw new Error(activationError)
        }
        
        console.log('Free campaign activated successfully')
        setLoading(false)
        
        // Show success message and redirect
        router.push('/dashboard?freeCampaign=true')
      } else {
        // User needs to pay - show payment modal
        console.log('User needs to pay for campaign')
        setCreatedCampaignId(id)
        setShowPaymentModal(true)
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create campaign')
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    // Redirect to dashboard after successful payment
    router.push('/dashboard?payment=success')
  }

  const handlePaymentModalClose = () => {
    // If user closes modal without paying, redirect to dashboard
    setShowPaymentModal(false)
    router.push('/dashboard')
  }

  return (
    <AuthGuard>
      {/* Payment Modal */}
      {createdCampaignId && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentModalClose}
          campaignId={createdCampaignId}
          campaignName={formData.campaignName}
          onSuccess={handlePaymentSuccess}
        />
      )}

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
            <h2 className="text-primary text-2xl sm:text-3xl md:text-[38px] font-bold leading-tight text-center">
              Create New Campaign
            </h2>
            <p className="text-primary/70 text-sm sm:text-base font-normal leading-normal text-center max-w-md px-4">
              Upload a PNG frame and set up your campaign
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
                    Campaign Name
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
                    URL Slug
                  </label>
                  <input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => {
                      // Allow only lowercase letters, numbers, and hyphens
                      let sanitizedSlug = e.target.value.toLowerCase()
                      // Convert spaces to hyphens
                      sanitizedSlug = sanitizedSlug.replace(/\s+/g, '-')
                      // Remove invalid characters but keep hyphens
                      sanitizedSlug = sanitizedSlug.replace(/[^a-z0-9-]/g, '')
                      // Replace multiple consecutive hyphens with single hyphen
                      sanitizedSlug = sanitizedSlug.replace(/--+/g, '-')
                      setFormData(prev => ({ ...prev, slug: sanitizedSlug }))
                    }}
                    onBlur={(e) => {
                      // Clean up leading/trailing hyphens only on blur
                      const cleanedSlug = e.target.value.replace(/^-+|-+$/g, '')
                      if (cleanedSlug !== e.target.value) {
                        setFormData(prev => ({ ...prev, slug: cleanedSlug }))
                      }
                    }}
                    required
                    className="w-full px-4 py-3 sm:py-3.5 border border-[#00240033] rounded-xl text-base text-primary placeholder:text-[#00240066] focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all bg-white"
                    placeholder="campaign-url-slug"
                  />
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
                    placeholder="Optional description for your campaign"
                  />
                </div>

                {/* Visibility */}
                <div className="flex flex-col gap-2 w-full">
                  <label className="text-primary text-sm sm:text-base font-semibold">
                    Visibility
                  </label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-white/50 transition-colors">
                      <input
                        type="radio"
                        value="Public"
                        checked={formData.visibility === 'Public'}
                        onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'Public' | 'Unlisted' }))}
                        className="mt-1 text-secondary focus:ring-secondary flex-shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="text-primary text-sm sm:text-base font-medium">Public</span>
                        <span className="text-primary/60 text-xs sm:text-sm">Anyone can find and use this campaign</span>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-white/50 transition-colors">
                      <input
                        type="radio"
                        value="Unlisted"
                        checked={formData.visibility === 'Unlisted'}
                        onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'Public' | 'Unlisted' }))}
                        className="mt-1 text-secondary focus:ring-secondary flex-shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="text-primary text-sm sm:text-base font-medium">Unlisted</span>
                        <span className="text-primary/60 text-xs sm:text-sm">Only people with the link can access</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

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
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                          <label htmlFor="file-upload-change" className="cursor-pointer flex-1 sm:flex-initial">
                            <div className="inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 active:scale-95 text-primary px-5 sm:px-6 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all w-full">
                              Change Image
                            </div>
                            <input
                              id="file-upload-change"
                              type="file"
                              accept=".png"
                              onChange={handleFileChange}
                              className="sr-only"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setFile(null)
                              setPreview(null)
                            }}
                            className="inline-flex items-center justify-center gap-2.5 border border-red-400 text-red-400 hover:bg-red-50 active:scale-95 px-5 sm:px-6 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 sm:gap-5">
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex flex-col items-center gap-3 sm:gap-4">
                          <p className="text-gray-500 text-xs sm:text-sm text-center px-4">
                            Drag and drop your PNG file here, or click to browse
                          </p>
                          <label htmlFor="file-upload" className="cursor-pointer w-full sm:w-auto">
                            <div className="inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 active:scale-95 text-primary px-5 sm:px-6 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all w-full">
                              Upload PNG Frame
                            </div>
                            <input
                              id="file-upload"
                              type="file"
                              accept=".png"
                              onChange={handleFileChange}
                              className="sr-only"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-primary/60 text-xs leading-relaxed">
                    PNG format with transparency required • Minimum size: 1080×1080px • Maximum file size: 10MB
                  </p>
                </div>
              </div>
            {/* Submit Button - Full Width Below Both Columns */}
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 active:scale-95 text-primary px-6 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span>Creating...</span>
                </>
              ) : (
                'Create Campaign'
              )}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}