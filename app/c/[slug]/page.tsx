'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { getCampaignBySlug, incrementSupportersCount, Campaign } from '@/lib/firestore'
import { ShareIcon, ArrowDownTrayIcon, PhotoIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner'
import html2canvas from 'html2canvas'

interface ImageTransform {
  x: number
  y: number
  scale: number
}

export default function CampaignPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [userImage, setUserImage] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [transform, setTransform] = useState<ImageTransform>({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setCampaign(campaignData)
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
    setTransform(newTransform)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
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

      // Draw user's photo with their positioning/scaling
      const scaleFactor = 1080 / 400 // Scale from 400px preview to 1080px download
      
      ctx.save()
      ctx.translate(540, 540) // Center of 1080px canvas
      ctx.scale(transform.scale * scaleFactor, transform.scale * scaleFactor)
      ctx.translate(transform.x * scaleFactor, transform.y * scaleFactor)
      ctx.drawImage(userImg, -userImg.width / 2, -userImg.height / 2)
      ctx.restore()
      console.log('✅ User photo drawn as background layer')

      // Step 2: Load and draw frame PNG via proxy (FOREGROUND LAYER with transparency)
      const frameImg = new Image()
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(campaign.frameURL)}`
      console.log('🔄 Loading frame via proxy:', proxyUrl)
      
      frameImg.crossOrigin = 'anonymous'
      frameImg.src = proxyUrl
      
      await new Promise<void>((resolve, reject) => {
        frameImg.onload = () => {
          console.log('✅ Frame PNG loaded via proxy, size:', frameImg.width, 'x', frameImg.height)
          resolve()
        }
        frameImg.onerror = (e) => {
          console.error('❌ Frame failed to load via proxy:', e)
          console.error('Proxy URL was:', proxyUrl)
          reject(e)
        }
        // Add timeout to avoid hanging
        setTimeout(() => reject(new Error('Frame load timeout')), 10000)
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

      // Increment supporters count
      if (campaign.id) {
        await incrementSupportersCount(campaign.id)
        setCampaign(prev => prev ? { ...prev, supportersCount: prev.supportersCount + 1 } : null)
      }

    } catch (error) {
      console.error('❌ Error creating combined image:', error)
      alert('Error generating image. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleShare = async () => {
    if (!userImage || !campaign) return

    setProcessing(true)
    
    try {
      console.log('🎯 Starting html2canvas share...')
      
      // Get the final image container
      const target = document.getElementById('final-image-container')
      if (!target) {
        // Fallback: copy campaign link
        await navigator.clipboard.writeText(window.location.href)
        alert('Campaign link copied to clipboard!')
        return
      }

      // Capture the visual representation for sharing
      const canvas = await html2canvas(target, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
        logging: false,
        allowTaint: true,
        foreignObjectRendering: false
      })

      // Convert to blob for sharing
      canvas.toBlob(async (blob) => {
        if (!blob) {
          await navigator.clipboard.writeText(window.location.href)
          alert('Campaign link copied to clipboard!')
          return
        }

        const file = new File([blob], 'framed-photo.png', { type: 'image/png' })
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: campaign.campaignName,
            text: `Check out my photo with the ${campaign.campaignName} frame!`,
            files: [file]
          })
        } else {
          // Fallback: copy campaign link
          await navigator.clipboard.writeText(window.location.href)
          alert('Campaign link copied to clipboard!')
        }
      }, 'image/png', 1.0)

    } catch (error) {
      console.error('Error sharing:', error)
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Campaign link copied to clipboard!')
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError)
      }
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h1>
          <p className="text-gray-600">The campaign you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <p className="text-sm text-gray-500 mt-4">Slug: {slug}</p>
        </div>
      </div>
    )
  }

  if (campaign.status === 'Inactive') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign Inactive</h1>
          <p className="text-gray-600">This campaign is currently inactive and not accepting new frames.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.campaignName}</h1>
          {campaign.description && (
            <p className="text-gray-600 max-w-2xl mx-auto mb-4">{campaign.description}</p>
          )}
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>{campaign.supportersCount} supporters</span>
            <span>•</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              campaign.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {campaign.status}
            </span>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          {/* Frame Preview Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Frame Preview</h2>
            
            {/* Layered Frame Display */}
            <div 
              id="final-image-container" 
              className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative w-full max-w-[400px] mx-auto"
            >
              {/* User Photo Canvas (Background Layer) */}
              {userImage && (
                <canvas
                  ref={previewCanvasRef}
                  width={400}
                  height={400}
                  className="absolute inset-0 w-full h-full"
                  style={{ zIndex: 1 }}
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
                  } ${isDragging ? 'bg-green-400 bg-opacity-10' : ''}`}
                  style={{ zIndex: 3 }}
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
                    setTransform(newTransform)
                  }}
                  onTouchEnd={() => setIsDragging(false)}
                />
              )}
              
              {isDragging && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs" style={{ zIndex: 4 }}>
                  Drag to position
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500 text-center mb-4">
              {!userImage ? 'Click to upload your photo' : 'Your photo will appear behind the transparent areas'}
            </p>

            {/* Upload Button */}
            {!userImage && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-full flex items-center justify-center space-x-3 transition-colors"
              >
                <PhotoIcon className="w-6 h-6" />
                <span className="text-lg font-medium">Choose Your Photo</span>
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

          {/* Photo Controls - Only show when image is loaded */}
          {userImage && (
            <div className="space-y-4">
              {/* Change Photo Button */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  Change Photo
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => handleZoom(-0.1)}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Zoom Out"
                  >
                    <MagnifyingGlassMinusIcon className="h-5 w-5" />
                  </button>
                  
                  <span className="text-sm text-gray-600 min-w-16 text-center font-mono">
                    {Math.round(transform.scale * 100)}%
                  </span>
                  
                  <button
                    onClick={() => handleZoom(0.1)}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Zoom In"
                  >
                    <MagnifyingGlassPlusIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex justify-center mt-3">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Reset Position
                  </button>
                </div>

                <div className="text-center mt-3">
                  <p className="text-xs text-gray-500">
                    🖱️ Drag to move • 🔍 Use zoom buttons • Your photo goes behind the frame
                  </p>
                </div>
              </div>

              {/* Download Section */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="space-y-3">
                  <button
                    onClick={handleDownload}
                    disabled={processing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        <span>Download Final Image</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleShare}
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
                  >
                    <ShareIcon className="h-5 w-5" />
                    <span>Share Framed Photo</span>
                  </button>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      💡 Download includes the frame with your photo showing through transparent areas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for high-resolution rendering */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}