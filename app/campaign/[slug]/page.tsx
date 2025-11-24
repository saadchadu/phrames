'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { getCampaignBySlug, incrementSupportersCount, incrementCampaignVisit, incrementCampaignDownload, Campaign } from '@/lib/firestore'
import { getUserProfile, UserProfile } from '@/lib/auth'
import { ArrowDownTrayIcon, PhotoIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner'
import CampaignQRCode from '@/components/CampaignQRCode'
import { useAuth } from '@/components/AuthProvider'

// Prevent static generation for this dynamic page
export const dynamic = 'force-dynamic'

interface ImageTransform {
  x: number
  y: number
  scale: number
}

export default function CampaignPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useAuth()
  
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [creatorProfile, setCreatorProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [userImage, setUserImage] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [transform, setTransform] = useState<ImageTransform>({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showQRCode, setShowQRCode] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const rafRef = useRef<number | null>(null)
  const pendingTransformRef = useRef<ImageTransform | null>(null)

  useEffect(() => {
    if (slug) {
      loadCampaign()
    }
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCampaign = async () => {
    try {
      console.log('Loading campaign with slug:', slug)
      const campaignData = await getCampaignBySlug(slug)
      console.log('Campaign data loaded:', campaignData)
      
      // Check if campaign is active and not expired
      if (campaignData) {
        const isActive = campaignData.isActive
        
        // Check if campaign is active
        if (!isActive) {
          console.log('Campaign is inactive')
          setCampaign(null) // Will show inactive message
          setLoading(false)
          return
        }
        
        // Check expiry for all campaigns (including free)
        const hasExpiry = campaignData.expiresAt
        const isExpired = hasExpiry && campaignData.expiresAt.toDate() < new Date()
        
        if (isExpired) {
          console.log('Campaign is expired')
          setCampaign(null) // Will show inactive message
          setLoading(false)
          return
        }
      }
      
      setCampaign(campaignData)

      // Load creator profile
      if (campaignData?.createdBy) {
        const profile = await getUserProfile(campaignData.createdBy)
        setCreatorProfile(profile)
      }

      // Track visit (only once per session)
      if (campaignData?.id) {
        const visitKey = `visited_${campaignData.id}`
        const hasVisited = sessionStorage.getItem(visitKey)
        
        if (!hasVisited) {
          try {
            await incrementCampaignVisit(campaignData.id)
            sessionStorage.setItem(visitKey, 'true')
            console.log('Campaign visit tracked')
          } catch (error) {
            console.error('Error tracking visit:', error)
            // Don't block page load on tracking error
          }
        }
      }
    } catch (error) {
      console.error('Error loading campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderUserImageCanvas = useCallback(async (canvas: HTMLCanvasElement, imageUrl: string, currentTransform: ImageTransform) => {
    if (!canvas || !imageUrl) {
      console.log('Missing requirements for user image canvas render:', { canvas: !!canvas, imageUrl: !!imageUrl })
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 400
    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    try {
      console.log('Rendering user image on canvas')
      
      // Load user image
      const userImg = new Image()
      userImg.crossOrigin = 'anonymous'
      
      await new Promise<void>((resolve, reject) => {
        userImg.onload = () => {
          console.log('User image loaded:', userImg.width, 'x', userImg.height)
          resolve()
        }
        userImg.onerror = (e) => {
          console.error('User image failed to load:', e)
          reject(e)
        }
        userImg.src = imageUrl
      })

      // Save context for user image
      ctx.save()
      
      // Apply transform to user image
      ctx.translate(size / 2, size / 2)
      ctx.scale(currentTransform.scale, currentTransform.scale)
      ctx.translate(currentTransform.x, currentTransform.y)
      
      // Draw user image
      ctx.drawImage(userImg, -userImg.width / 2, -userImg.height / 2)
      console.log('User image drawn on canvas')
      
      // Restore context
      ctx.restore()

    } catch (error) {
      console.error('Error rendering user image canvas:', error)
    }
  }, [])

  const renderFinalCanvas = useCallback(async (canvas: HTMLCanvasElement, imageUrl: string, currentTransform: ImageTransform, isHighRes = false) => {
    if (!canvas || !imageUrl || !campaign?.frameURL) {
      console.log('Missing requirements for final canvas render:', { canvas: !!canvas, imageUrl: !!imageUrl, frameURL: !!campaign?.frameURL })
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = isHighRes ? 1080 : 400
    canvas.width = size
    canvas.height = size

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, size, size)

    try {
      console.log('🎯 Starting STITCHED frame render with size:', size)
      console.log('Frame URL being used:', campaign.frameURL)
      
      // Load frame image FIRST to get its dimensions and structure
      const frameImg = new Image()
      frameImg.crossOrigin = 'anonymous'
      
      await new Promise<void>((resolve, reject) => {
        frameImg.onload = () => {
          console.log('✅ Frame image loaded for stitching:', frameImg.width, 'x', frameImg.height)
          resolve()
        }
        frameImg.onerror = (e) => {
          console.error('❌ Frame image failed to load for stitching:', e)
          reject(e)
        }
        frameImg.src = campaign.frameURL
      })

      // Load user image
      const userImg = new Image()
      userImg.crossOrigin = 'anonymous'
      
      await new Promise<void>((resolve, reject) => {
        userImg.onload = () => {
          console.log('✅ User image loaded for stitching:', userImg.width, 'x', userImg.height)
          resolve()
        }
        userImg.onerror = (e) => {
          console.error('❌ User image failed to load for stitching:', e)
          reject(e)
        }
        userImg.src = imageUrl
      })

      // Calculate scale factor
      const scaleFactor = isHighRes ? size / 400 : 1

      // STEP 1: Draw user image FIRST (background layer)
      ctx.save()
      
      // Apply transform to user image
      ctx.translate(size / 2, size / 2)
      ctx.scale(currentTransform.scale * scaleFactor, currentTransform.scale * scaleFactor)
      ctx.translate(currentTransform.x / scaleFactor, currentTransform.y / scaleFactor)
      
      // Draw user image as background
      ctx.drawImage(userImg, -userImg.width / 2, -userImg.height / 2)
      console.log('✅ User image drawn as background layer')
      
      ctx.restore()

      // STEP 2: Draw frame ON TOP (foreground layer with transparency)
      ctx.globalCompositeOperation = 'source-over'
      ctx.drawImage(frameImg, 0, 0, size, size)
      console.log('✅ Frame drawn on top with transparency')
      
      console.log('🎉 STITCHED frame render complete: Frame with user photo in transparent areas')

    } catch (error) {
      console.error('❌ Error rendering final canvas:', error)
      // Fallback: just draw the user image if frame fails
      console.log('🔄 Attempting fallback render with just user image...')
      try {
        const userImg = new Image()
        await new Promise<void>((resolve, reject) => {
          userImg.onload = () => resolve()
          userImg.onerror = reject
          userImg.src = imageUrl
        })
        
        ctx.clearRect(0, 0, size, size)
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, size, size)
        
        const scaleFactor = isHighRes ? size / 400 : 1
        ctx.save()
        ctx.translate(size / 2, size / 2)
        ctx.scale(currentTransform.scale * scaleFactor, currentTransform.scale * scaleFactor)
        ctx.translate(currentTransform.x / scaleFactor, currentTransform.y / scaleFactor)
        ctx.drawImage(userImg, -userImg.width / 2, -userImg.height / 2)
        ctx.restore()
        
        console.log('⚠️ Fallback render completed (user image only)')
      } catch (fallbackError) {
        console.error('❌ Fallback render also failed:', fallbackError)
      }
    }
  }, [campaign?.frameURL])

  const updatePreview = useCallback((imageUrl: string, currentTransform: ImageTransform) => {
    const canvas = previewCanvasRef.current
    if (canvas) {
      renderUserImageCanvas(canvas, imageUrl, currentTransform)
    }
  }, [renderUserImageCanvas])

  useEffect(() => {
    if (userImage) {
      updatePreview(userImage, transform)
    }
  }, [userImage, transform, updatePreview])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setUserImage(imageUrl)
      
      // Auto-fit the image
      const img = new Image()
      img.onload = () => {
        const canvasSize = 400
        const imageAspect = img.width / img.height
        
        // Scale to cover the entire canvas
        let initialScale = Math.max(canvasSize / img.width, canvasSize / img.height)
        
        const initialTransform = { x: 0, y: 0, scale: initialScale }
        setTransform(initialTransform)
        updatePreview(imageUrl, initialTransform)
      }
      img.src = imageUrl
    }
    reader.readAsDataURL(file)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!userImage) return
    e.preventDefault()
    setIsDragging(true)
    
    const rect = e.currentTarget.getBoundingClientRect()
    setDragStart({ 
      x: e.clientX - rect.left - transform.x, 
      y: e.clientY - rect.top - transform.y 
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !userImage) return
    e.preventDefault()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const newTransform = {
      ...transform,
      x: e.clientX - rect.left - dragStart.x,
      y: e.clientY - rect.top - dragStart.y
    }
    
    // Store the pending transform
    pendingTransformRef.current = newTransform
    
    // Use requestAnimationFrame for smooth updates
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        if (pendingTransformRef.current) {
          setTransform(pendingTransformRef.current)
          pendingTransformRef.current = null
        }
        rafRef.current = null
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    // Cancel any pending animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const handleZoom = (delta: number) => {
    if (!userImage) return
    const newScale = Math.max(0.1, Math.min(5, transform.scale + delta))
    setTransform(prev => ({ ...prev, scale: newScale }))
  }

  const handleReset = () => {
    if (!userImage) return
    
    // Reset to auto-fit
    const img = new Image()
    img.onload = () => {
      const canvasSize = 400
      const initialScale = Math.max(canvasSize / img.width, canvasSize / img.height)
      setTransform({ x: 0, y: 0, scale: initialScale })
    }
    img.src = userImage
  }

  const handleDownload = async () => {
    if (!userImage || !campaign) return

    setProcessing(true)
    
    try {
      console.log('🎯 Creating single canvas with frame + user photo...')
      
      // Create final canvas for download
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1080
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Could not get canvas context')
      }

      // Step 1: Load and draw user's photo (BACKGROUND LAYER)
      const userImg = new Image()
      userImg.src = userImage
      
      await new Promise<void>((resolve, reject) => {
        userImg.onload = () => {
          console.log('✅ User image loaded for final canvas')
          resolve()
        }
        userImg.onerror = reject
      })

      // Draw user's photo with EXACT same positioning as preview
      const scaleFactor = 1080 / 400 // Scale from 400px preview to 1080px download
      
      ctx.save()
      
      // Use EXACT same transform logic as preview canvas
      ctx.translate(1080 / 2, 1080 / 2) // Center of 1080px canvas (same as size/2 in preview)
      ctx.scale(transform.scale, transform.scale) // Use original scale (not multiplied by scaleFactor)
      ctx.translate(transform.x * scaleFactor, transform.y * scaleFactor) // Scale the position
      
      // Draw user image (scale the image itself for high-res)
      const imageWidth = userImg.width * scaleFactor
      const imageHeight = userImg.height * scaleFactor
      ctx.drawImage(userImg, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight)
      
      ctx.restore()
      console.log('✅ User photo drawn with exact preview positioning')

      // Step 2: Load and draw frame PNG via proxy (FOREGROUND LAYER with transparency)
      const frameImg = new Image()
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(campaign.frameURL)}`
      console.log('🔄 Loading frame via proxy:', proxyUrl)
      
      frameImg.crossOrigin = 'anonymous'
      
      await new Promise<void>((resolve, reject) => {
        frameImg.onload = () => {
          console.log('✅ Frame PNG loaded via proxy, size:', frameImg.width, 'x', frameImg.height)
          resolve()
        }
        frameImg.onerror = async (e) => {
          console.warn('⚠️ Proxy failed, trying direct URL...')
          
          // Fallback: try direct URL without crossOrigin
          const fallbackImg = new Image()
          fallbackImg.onload = () => {
            console.log('✅ Frame loaded via fallback')
            // Copy properties to main image
            frameImg.width = fallbackImg.width
            frameImg.height = fallbackImg.height
            frameImg.src = fallbackImg.src
            resolve()
          }
          fallbackImg.onerror = () => {
            console.error('❌ Both proxy and direct loading failed')
            reject(new Error('Frame loading failed'))
          }
          fallbackImg.src = campaign.frameURL
        }
        
        // Start with proxy
        frameImg.src = proxyUrl
        
        // Add timeout to avoid hanging
        setTimeout(() => reject(new Error('Frame load timeout')), 15000)
      })

      // Draw frame PNG on top (transparent areas will show user photo)
      ctx.drawImage(frameImg, 0, 0, 1080, 1080)
      console.log('✅ Frame PNG drawn on top - transparent areas show user photo')

      // Step 3: Download the single combined image using toBlob (handles tainted canvas)
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('❌ Failed to create blob from canvas')
          alert('Error generating image. Please try again.')
          return
        }
        
        console.log('✅ Blob created successfully, size:', blob.size)
        
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        const timestamp = Date.now()
        link.download = `${campaign.campaignName}-framed-photo-${timestamp}.png`
        link.href = url
        link.click()
        
        // Clean up the object URL
        setTimeout(() => URL.revokeObjectURL(url), 100)
        
        console.log('🎉 Single combined image downloaded!')
      }, 'image/png', 1.0)

      // Increment supporters count and track download
      if (campaign.id) {
        await incrementSupportersCount(campaign.id)
        setCampaign(prev => prev ? { ...prev, supportersCount: prev.supportersCount + 1 } : null)
        
        // Track download for analytics
        try {
          await incrementCampaignDownload(campaign.id)
          console.log('Campaign download tracked')
        } catch (error) {
          console.error('Error tracking download:', error)
          // Don't block download on tracking error
        }
      }

    } catch (error) {
      console.error('❌ Error creating combined image:', error)
      alert('Error generating image. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Loading campaign..." />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign Inactive</h1>
          <p className="text-gray-600 mb-4">
            This campaign is currently inactive. Please contact the creator to reactivate it.
          </p>
          <p className="text-sm text-gray-500">Campaign: {slug}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-11">
        {/* Compact Header - Shows when photo is uploaded */}
        {userImage && (
          <div className="mb-6 sm:mb-8 bg-white border border-[#00240010] rounded-2xl p-4 sm:p-6 lg:p-7 shadow-sm">
            <div className="flex flex-col gap-3">
              {/* Title & Creator */}
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl lg:text-[22px] font-semibold text-primary mb-2">{campaign.campaignName}</h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  {creatorProfile && (
                    <div className="flex items-center gap-2">
                      {creatorProfile.photoURL ? (
                        <img
                          src={creatorProfile.photoURL}
                          alt={creatorProfile.displayName || 'Creator'}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-secondary/20 flex items-center justify-center">
                          <span className="text-primary font-medium text-xs">
                            {(creatorProfile.displayName || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-primary/70">{creatorProfile.displayName || 'Anonymous'}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap">
                <span className="text-primary/60">{campaign.supportersCount} supporters</span>
                <span className="text-primary/30">•</span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    campaign.status === 'Active' ? 'bg-secondary' : 'bg-gray-400'
                  }`} />
                  <span className="text-primary/60">{campaign.status}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`mx-auto ${userImage ? 'max-w-6xl' : 'max-w-5xl'}`}>
          <div className={`grid grid-cols-1 ${userImage ? 'lg:grid-cols-2' : 'lg:grid-cols-2'} gap-6 sm:gap-8 lg:gap-9`}>
            {/* Left Column - Frame Preview */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="bg-white border border-[#00240010] rounded-2xl p-4 sm:p-6 lg:p-7 shadow-sm">
                <h2 className="text-base sm:text-lg lg:text-[19px] font-semibold text-primary mb-3 sm:mb-4">Frame Preview</h2>
            
                {/* Layered Frame Display */}
                <div 
                  id="final-image-container" 
                  className="aspect-square bg-white rounded-xl overflow-hidden mb-3 sm:mb-4 relative w-full border border-[#00240010] touch-none"
                >
              {/* User Photo Canvas (Background Layer) */}
              {userImage && (
                <canvas
                  ref={previewCanvasRef}
                  width={400}
                  height={400}
                  className="absolute inset-0 w-full h-full"
                  style={{ 
                    zIndex: 1,
                    willChange: isDragging ? 'transform' : 'auto'
                  }}
                />
              )}
              
              {/* Frame Image (Foreground Layer) */}
              <img
                src={campaign.frameURL}
                alt={campaign.campaignName}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{ zIndex: 2 }}
              />
              
              {/* Invisible interaction layer for dragging */}
              {userImage && (
                <div
                  className={`absolute inset-0 w-full h-full ${
                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                  } select-none`}
                  style={{ 
                    zIndex: 3,
                    touchAction: 'none',
                    userSelect: 'none'
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={(e) => {
                    if (!userImage) return
                    e.preventDefault()
                    const touch = e.touches[0]
                    const rect = e.currentTarget.getBoundingClientRect()
                    setIsDragging(true)
                    setDragStart({ 
                      x: touch.clientX - rect.left - transform.x, 
                      y: touch.clientY - rect.top - transform.y 
                    })
                  }}
                  onTouchMove={(e) => {
                    if (!isDragging || !userImage) return
                    e.preventDefault()
                    const touch = e.touches[0]
                    const rect = e.currentTarget.getBoundingClientRect()
                    const newTransform = {
                      ...transform,
                      x: touch.clientX - rect.left - dragStart.x,
                      y: touch.clientY - rect.top - dragStart.y
                    }
                    
                    // Store the pending transform
                    pendingTransformRef.current = newTransform
                    
                    // Use requestAnimationFrame for smooth updates
                    if (!rafRef.current) {
                      rafRef.current = requestAnimationFrame(() => {
                        if (pendingTransformRef.current) {
                          setTransform(pendingTransformRef.current)
                          pendingTransformRef.current = null
                        }
                        rafRef.current = null
                      })
                    }
                  }}
                  onTouchEnd={() => {
                    setIsDragging(false)
                    // Cancel any pending animation frame
                    if (rafRef.current) {
                      cancelAnimationFrame(rafRef.current)
                      rafRef.current = null
                    }
                  }}
                />
              )}
              
                  {isDragging && (
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-primary text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium shadow-lg" style={{ zIndex: 4 }}>
                      Drag to position
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-primary/60 text-center mb-4 sm:mb-5">
                  {!userImage ? 'Your photo will appear behind the transparent areas' : 'Drag to reposition • Pinch to zoom'}
                </p>

                {/* Upload Button */}
                {!userImage && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-secondary hover:bg-secondary/90 active:scale-95 text-primary px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-semibold text-base sm:text-lg shadow-sm"
                  >
                    <PhotoIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Choose Photo</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Right Column - Campaign Details (before photo) or Controls (after photo) */}
            {!userImage ? (
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Campaign Details */}
                <div className="bg-white border border-[#00240010] rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm">
                  <h1 className="text-xl sm:text-2xl lg:text-[26px] font-semibold text-primary mb-2 sm:mb-3 leading-tight">{campaign.campaignName}</h1>
                  {campaign.description && (
                    <p className="text-primary/70 text-sm sm:text-base leading-relaxed mb-4 sm:mb-5">{campaign.description}</p>
                  )}
                  
                  {/* Stats */}
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm mb-5 sm:mb-7 pb-5 sm:pb-7 border-b border-[#00240010] flex-wrap">
                    <span className="text-primary/60">{campaign.supportersCount} supporters</span>
                    <span className="text-primary/30">•</span>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                        campaign.status === 'Active' ? 'bg-secondary' : 'bg-gray-400'
                      }`} />
                      <span className="text-primary/60">{campaign.status}</span>
                    </div>
                  </div>

                  {/* Creator Info */}
                  <div className="flex items-center gap-3 text-sm sm:text-base">
                    {creatorProfile && (
                      <>
                        {creatorProfile.photoURL ? (
                          <img
                            src={creatorProfile.photoURL}
                            alt={creatorProfile.displayName || 'Creator'}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-semibold text-base sm:text-lg">
                              {(creatorProfile.displayName || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-primary font-semibold">{creatorProfile.displayName || 'Anonymous'}</p>
                          {campaign.createdAt && (
                            <p className="text-primary/60 text-xs sm:text-sm">
                              Created {new Date(campaign.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* QR Code Section - Only visible to campaign owner */}
                {user && campaign.createdBy === user.uid && (
                  <div className="bg-white border border-[#00240010] rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm">
                    <button
                      onClick={() => setShowQRCode(!showQRCode)}
                      className="w-full flex items-center justify-between text-left mb-4"
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-primary">Campaign QR Code</h3>
                      <span className="text-primary/60 text-sm">{showQRCode ? 'Hide' : 'Show'}</span>
                    </button>
                    {showQRCode && (
                      <div className="pt-2">
                        <p className="text-primary/70 text-xs sm:text-sm mb-4">
                          Share your campaign with a QR code
                        </p>
                        <CampaignQRCode 
                          slug={campaign.slug} 
                          campaignName={campaign.campaignName}
                          size={160}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Change Photo Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-white border border-[#00240010] hover:border-[#00240020] active:scale-95 text-primary px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all shadow-sm"
                >
                  Change Photo
                </button>

                {/* Adjust & Download Section */}
                <div className="bg-white border border-[#00240010] rounded-2xl p-5 sm:p-6 lg:p-7 shadow-sm">
                  <h3 className="text-base sm:text-lg lg:text-[19px] font-semibold text-primary mb-4 sm:mb-5">Adjust & Download</h3>
                  
                  {/* Zoom Slider */}
                  <div className="mb-4 sm:mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs sm:text-sm font-medium text-primary">Zoom</label>
                      <span className="text-xs sm:text-sm text-primary/70 font-semibold">
                        {Math.round(transform.scale * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => handleZoom(-0.1)}
                        className="p-2 sm:p-2.5 hover:bg-[#00240005] active:scale-95 rounded-xl transition-all flex-shrink-0"
                        title="Zoom Out"
                        aria-label="Zoom out"
                      >
                        <MagnifyingGlassMinusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </button>
                      
                      <input
                        type="range"
                        min="10"
                        max="500"
                        value={Math.round(transform.scale * 100)}
                        onChange={(e) => {
                          const newScale = parseInt(e.target.value) / 100
                          setTransform(prev => ({ ...prev, scale: newScale }))
                        }}
                        className="flex-1 h-2 bg-[#00240010] rounded-xl appearance-none cursor-pointer slider touch-none"
                        style={{
                          background: `linear-gradient(to right, #00dd78 0%, #00dd78 ${((transform.scale * 100 - 10) / (500 - 10)) * 100}%, #00240010 ${((transform.scale * 100 - 10) / (500 - 10)) * 100}%, #00240010 100%)`
                        }}
                      />
                      
                      <button
                        onClick={() => handleZoom(0.1)}
                        className="p-2 sm:p-2.5 hover:bg-[#00240005] active:scale-95 rounded-xl transition-all flex-shrink-0"
                        title="Zoom In"
                        aria-label="Zoom in"
                      >
                        <MagnifyingGlassPlusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="w-full px-5 sm:px-6 py-3 sm:py-3.5 bg-white border border-[#00240010] hover:border-[#00240020] active:scale-95 text-primary rounded-2xl text-sm sm:text-base font-medium transition-all mb-4 sm:mb-5 shadow-sm"
                  >
                    Reset Position
                  </button>

                  <p className="text-xs sm:text-sm text-primary/60 text-center mb-4 sm:mb-5">
                    Drag to move • Use slider to zoom
                  </p>

                  {/* Divider */}
                  <div className="border-t border-[#00240010] my-4 sm:my-5"></div>

                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    disabled={processing}
                    className="w-full bg-secondary hover:bg-secondary/90 active:scale-95 text-primary px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-sm"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span>Download Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hidden canvas for high-resolution rendering */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  )
}