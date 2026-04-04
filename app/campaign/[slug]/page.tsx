'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getCampaignBySlug, incrementCampaignVisit, incrementCampaignDownload, Campaign, parseFirestoreDate } from '@/lib/firestore'
import { getSessionId } from '@/lib/supporters'
import { getUserProfile, UserProfile } from '@/lib/auth'
import { normalizeToCdnUrl } from '@/lib/cdn'
import { ArrowDownTrayIcon, PhotoIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, ScissorsIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner'
import CampaignQRCode from '@/components/CampaignQRCode'
import ImageCropModal, { CropMeta } from '@/components/ImageCropModal'
import { useAuth } from '@/components/AuthProvider'
import useCampaignStats from '@/hooks/useCampaignStats'
import ClientOnly from '@/components/ClientOnly'
import { useDialog } from '@/hooks/useDialog'
import AlertDialog from '@/components/ui/AlertDialog'

export const dynamic = 'force-dynamic'

interface ImageTransform { x: number; y: number; scale: number }

export default function CampaignPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useAuth()
  const { alertState, showAlert, closeAlert } = useDialog()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [creatorProfile, setCreatorProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [userImage, setUserImage] = useState<string | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [transform, setTransform] = useState<ImageTransform>({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showCropModal, setShowCropModal] = useState(false)
  const [frameNativeSize, setFrameNativeSize] = useState<{ width: number; height: number } | null>(null)
  const [cropMeta, setCropMeta] = useState<CropMeta | null>(null)

  const previewContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const rafRef = useRef<number | null>(null)
  const pendingTransformRef = useRef<ImageTransform | null>(null)
  const transformRef = useRef<ImageTransform>({ x: 0, y: 0, scale: 1 })
  const dragStartRef = useRef({ x: 0, y: 0 })
  // Pinch-to-zoom
  const pinchStartDistRef = useRef<number | null>(null)
  const pinchStartScaleRef = useRef<number>(1)

  const { stats: campaignStats } = useCampaignStats(campaign?.id || null)

  useEffect(() => { if (slug) loadCampaign() }, [slug]) // eslint-disable-line

  useEffect(() => { transformRef.current = transform }, [transform])

  const loadCampaign = async () => {
    try {
      const campaignData = await getCampaignBySlug(slug)
      if (campaignData) {
        if (!campaignData.isActive) { setCampaign(null); setLoading(false); return }

        const isPaid = !!campaignData.paymentId && campaignData.paymentId !== 'null' && campaignData.paymentId !== 'undefined'
        const createdDate = parseFirestoreDate(campaignData.createdAt)

        if (!isPaid && createdDate) {
          const exp = new Date(createdDate); exp.setDate(exp.getDate() + 30)
          if (exp < new Date()) { setCampaign(null); setLoading(false); return }
        }
        if (campaignData.expiresAt) {
          const expDate = parseFirestoreDate(campaignData.expiresAt)
          if (expDate && expDate < new Date()) { setCampaign(null); setLoading(false); return }
        } else if (createdDate) {
          const exp = new Date(createdDate); exp.setDate(exp.getDate() + 30)
          if (exp < new Date()) { setCampaign(null); setLoading(false); return }
        }
      }
      setCampaign(campaignData)
      if (campaignData?.createdBy) {
        const profile = await getUserProfile(campaignData.createdBy)
        setCreatorProfile(profile)
      }
      if (campaignData?.id) {
        const visitKey = `visited_${campaignData.id}`
        if (!sessionStorage.getItem(visitKey)) {
          try { await incrementCampaignVisit(campaignData.id); sessionStorage.setItem(visitKey, 'true') } catch {}
        }
      }
    } catch (e) { console.error('Error loading campaign:', e) }
    finally { setLoading(false) }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showAlert({ title: 'Invalid File', message: 'Please select an image file', type: 'error' }); return
    }
    if (file.size > 10 * 1024 * 1024) {
      showAlert({ title: 'File Too Large', message: 'Image must be less than 10MB', type: 'error' }); return
    }
    const reader = new FileReader()
    reader.onload = (ev) => { setOriginalImage(ev.target?.result as string); setShowCropModal(true) }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = (croppedImage: string, meta: CropMeta) => {
    setUserImage(croppedImage)
    setCropMeta(meta)
    setTransform({ x: 0, y: 0, scale: 1 })
  }

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!userImage) return
    e.preventDefault()
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX - transformRef.current.x, y: e.clientY - transformRef.current.y }
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !userImage) return
    e.preventDefault()
    const next = { ...transformRef.current, x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y }
    transformRef.current = next
    pendingTransformRef.current = next
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        if (pendingTransformRef.current) { setTransform(pendingTransformRef.current); pendingTransformRef.current = null }
        rafRef.current = null
      })
    }
  }, [isDragging, userImage])

  const handleMouseUp = () => {
    setIsDragging(false)
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }

  const handleZoom = (delta: number) => {
    if (!userImage) return
    setTransform(prev => ({ ...prev, scale: Math.max(0.25, Math.min(4, prev.scale + delta)) }))
  }

  const handleReset = () => { if (userImage) setTransform({ x: 0, y: 0, scale: 1 }) }

  // ── Touch handlers (drag + pinch zoom) ────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!userImage) return
    e.preventDefault()
    if (e.touches.length === 1) {
      setIsDragging(true)
      const t = e.touches[0]
      dragStartRef.current = { x: t.clientX - transformRef.current.x, y: t.clientY - transformRef.current.y }
    } else if (e.touches.length === 2) {
      setIsDragging(false)
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchStartDistRef.current = Math.hypot(dx, dy)
      pinchStartScaleRef.current = transformRef.current.scale
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!userImage) return
    e.preventDefault()
    if (e.touches.length === 1 && isDragging) {
      const t = e.touches[0]
      const next = { ...transformRef.current, x: t.clientX - dragStartRef.current.x, y: t.clientY - dragStartRef.current.y }
      transformRef.current = next
      pendingTransformRef.current = next
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          if (pendingTransformRef.current) { setTransform(pendingTransformRef.current); pendingTransformRef.current = null }
          rafRef.current = null
        })
      }
    } else if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const newScale = Math.max(0.25, Math.min(4, pinchStartScaleRef.current * (dist / pinchStartDistRef.current)))
      const next = { ...transformRef.current, scale: newScale }
      transformRef.current = next
      setTransform(next)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    pinchStartDistRef.current = null
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!userImage || !campaign) return
    setProcessing(true)
    try {
      const frameImg = new Image()
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(cdnFrameUrl)}`
      frameImg.crossOrigin = 'anonymous'
      await new Promise<void>((resolve, reject) => {
        frameImg.onload = () => resolve()
        frameImg.onerror = async () => {
          const fb = new Image()
          fb.onload = () => { frameImg.src = fb.src; resolve() }
          fb.onerror = () => reject(new Error('Frame load failed'))
          fb.src = cdnFrameUrl
        }
        frameImg.src = proxyUrl
        setTimeout(() => reject(new Error('Frame load timeout')), 15000)
      })

      const canvasWidth = frameImg.naturalWidth || frameImg.width
      const canvasHeight = frameImg.naturalHeight || frameImg.height

      // HiDPI canvas for sharp, premium output
      const scale = window.devicePixelRatio || 1
      const canvas = document.createElement('canvas')
      canvas.width = canvasWidth * scale
      canvas.height = canvasHeight * scale
      const ctx = canvas.getContext('2d')!
      ctx.scale(scale, scale)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      const userImg = new Image()
      if (userImage.startsWith('http')) userImg.crossOrigin = 'anonymous'
      userImg.src = userImage
      await new Promise<void>((resolve, reject) => { userImg.onload = () => resolve(); userImg.onerror = reject })

      if (cropMeta) {
        const { brightness, contrast, saturation } = cropMeta
        if (brightness !== 100 || contrast !== 100 || saturation !== 100)
          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
      }

      ctx.save()
      const containerRect = previewContainerRef.current?.getBoundingClientRect()
      const cssW = containerRect?.width || canvasWidth
      const cssH = containerRect?.height || canvasHeight
      const toCanvasX = canvasWidth / cssW
      const toCanvasY = canvasHeight / cssH
      const fitScale = canvasHeight / userImg.height
      const drawScale = fitScale * transform.scale
      const drawW = userImg.width * drawScale
      const drawH = userImg.height * drawScale
      ctx.translate(canvasWidth / 2, canvasHeight / 2)
      ctx.translate(transform.x * toCanvasX, transform.y * toCanvasY)
      ctx.drawImage(userImg, -drawW / 2, -drawH / 2, drawW, drawH)
      ctx.restore()
      ctx.filter = 'none'
      ctx.drawImage(frameImg, 0, 0, canvasWidth, canvasHeight)

      canvas.toBlob((blob) => {
        if (!blob) { showAlert({ title: 'Error', message: 'Failed to generate image', type: 'error' }); return }
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `${campaign.campaignName}-framed-${Date.now()}.png`
        link.href = url; link.click()
        setTimeout(() => URL.revokeObjectURL(url), 100)
      }, 'image/png')

      if (campaign.id) {
        try {
          const res = await fetch('/api/supporters/add', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: campaign.id, userId: user?.uid, userEmail: user?.email, sessionId: getSessionId() })
          })
          const result = await res.json()
          if (result.success && result.isNewSupporter) {
            setCampaign(prev => prev ? { ...prev, supportersCount: prev.supportersCount + 1 } : null)
            setTimeout(() => loadCampaign(), 1000)
          }
        } catch {}
        try { await incrementCampaignDownload(campaign.id) } catch {}
      }
    } catch (e) {
      console.error('Download error:', e)
      showAlert({ title: 'Error', message: 'Failed to generate image. Please try again.', type: 'error' })
    } finally { setProcessing(false) }
  }

  // ── Loading / empty states ─────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <LoadingSpinner text="Loading campaign..." />
    </div>
  )

  if (!campaign) return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-[#00240008] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-primary mb-2">Campaign Inactive</h1>
        <p className="text-sm text-primary/60 mb-1">This campaign is currently inactive.</p>
        <p className="text-xs text-primary/40">{slug}</p>
      </div>
    </div>
  )

  const aspectRatioPadding = frameNativeSize
    ? `${(frameNativeSize.height / frameNativeSize.width) * 100}%`
    : ({ '4:5': '125%', '3:4': '133.33%', '9:16': '177.78%', '1:1': '100%' } as Record<string, string>)[campaign.aspectRatio || '1:1'] ?? '100%'

  // Normalize frameURL to CDN — handles both new hash-based and legacy Firebase Storage URLs
  const cdnFrameUrl = normalizeToCdnUrl(campaign.frameURL)

  const creatorAvatarSrc = (creatorProfile?.photoURL || creatorProfile?.avatarURL)?.startsWith('https://lh')
    ? `/api/image-proxy?url=${encodeURIComponent(creatorProfile?.photoURL || creatorProfile?.avatarURL || '')}`
    : creatorProfile?.photoURL || creatorProfile?.avatarURL || ''

  const zoomPct = Math.round(transform.scale * 100)
  const sliderFill = `linear-gradient(to right, #00dd78 0%, #00dd78 ${((zoomPct - 25) / 375) * 100}%, #00240010 ${((zoomPct - 25) / 375) * 100}%, #00240010 100%)`

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10">

        {/* ── Before upload: campaign info header ── */}
        {!userImage && (
          <div className="mb-5 sm:mb-7">
            <h1 className="text-2xl sm:text-3xl font-semibold text-primary mb-1 leading-tight">{campaign.campaignName}</h1>
            <div className="flex items-center gap-3 flex-wrap mt-2">
              {creatorProfile && (
                <Link href={creatorProfile.username ? `/user/${creatorProfile.username}` : '#'}
                  className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  {creatorAvatarSrc ? (
                    <img src={creatorAvatarSrc} alt={creatorProfile.displayName || ''} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                      <span className="text-primary text-xs font-medium">{(creatorProfile.displayName || 'U')[0].toUpperCase()}</span>
                    </div>
                  )}
                  <span className="text-sm text-primary/60">{creatorProfile.displayName || 'Anonymous'}</span>
                </Link>
              )}
              <span className="text-primary/20">•</span>
              <span className="text-sm text-primary/50">
                <ClientOnly fallback={<>{campaign.supportersCount} supporters</>}>
                  {campaignStats?.supportersCount ?? campaign.supportersCount} supporters
                </ClientOnly>
              </span>
              <span className="text-primary/20">•</span>
              <span className="flex items-center gap-1.5 text-sm text-primary/50">
                <span className={`w-1.5 h-1.5 rounded-full ${campaign.status === 'Active' ? 'bg-secondary' : 'bg-gray-400'}`} />
                {campaign.status}
              </span>
            </div>
          </div>
        )}

        {/* ── After upload: compact header ── */}
        {userImage && (
          <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs text-primary/40 uppercase tracking-widest font-medium mb-0.5">Frame Preview</p>
              <h1 className="text-base sm:text-lg font-semibold text-primary leading-tight">{campaign.campaignName}</h1>
            </div>
            <span className="text-sm text-primary/50">
              <ClientOnly fallback={<>{campaign.supportersCount} supporters</>}>
                {campaignStats?.supportersCount ?? campaign.supportersCount} supporters
              </ClientOnly>
            </span>
          </div>
        )}

        {/* ── Main grid ── */}
        <div className={`grid grid-cols-1 gap-4 sm:gap-6 ${userImage ? 'lg:grid-cols-[1fr_340px]' : 'lg:grid-cols-2'}`}>

          {/* ── Left: Frame Preview ── */}
          <div className={`flex flex-col gap-3 ${userImage ? 'lg:order-1' : ''}`}>
            <div className="bg-white border border-[#00240010] rounded-2xl p-4 sm:p-5 shadow-sm">
              {!userImage && <h2 className="text-base font-semibold text-primary mb-3">Frame Preview</h2>}

              {/* Frame container */}
              <div
                id="final-image-container"
                ref={previewContainerRef}
                className="rounded-xl overflow-hidden relative w-full border border-[#00240010] touch-none select-none bg-[#00240005]"
                style={{ paddingBottom: aspectRatioPadding }}
              >
                {/* User photo layer */}
                {userImage && (
                  <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
                    <img
                      src={userImage}
                      alt=""
                      draggable={false}
                      className="absolute pointer-events-none select-none"
                      style={{
                        left: '50%', top: '50%',
                        transform: `translate(calc(-50% + ${transform.x}px), calc(-50% + ${transform.y}px)) scale(${transform.scale})`,
                        transformOrigin: 'center center',
                        width: 'auto', height: '100%',
                        maxWidth: 'none', maxHeight: 'none',
                        willChange: isDragging ? 'transform' : 'auto',
                        transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                      }}
                    />
                  </div>
                )}

                {/* Frame overlay */}
                <img
                  src={cdnFrameUrl}
                  alt={campaign.campaignName}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  style={{ zIndex: 2, opacity: isDragging ? 0.45 : 1, transition: isDragging ? 'none' : 'opacity 0.2s ease' }}
                  onLoad={(e) => {
                    const img = e.currentTarget
                    setFrameNativeSize({ width: img.naturalWidth, height: img.naturalHeight })
                  }}
                />

                {/* Interaction layer */}
                {userImage && (
                  <div
                    className={`absolute inset-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    style={{ zIndex: 3, touchAction: 'none' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  />
                )}

                {/* Drag hint */}
                {isDragging && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-primary/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-medium pointer-events-none" style={{ zIndex: 4 }}>
                    Repositioning…
                  </div>
                )}

                {/* Empty state overlay */}
                {!userImage && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none" style={{ zIndex: 3 }}>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2">
                      <p className="text-xs text-primary/50 text-center">Your photo will appear here</p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-primary/40 text-center mt-2.5">
                {userImage ? 'Drag to reposition • Pinch to zoom' : 'Upload a photo to get started'}
              </p>

              {/* Upload button (before photo) */}
              {!userImage && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 w-full bg-secondary hover:bg-secondary/90 active:scale-[0.98] text-primary px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all font-semibold text-base shadow-sm"
                >
                  <PhotoIcon className="w-5 h-5" />
                  Choose Photo
                </button>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          </div>

          {/* ── Right column ── */}
          <div className={`flex flex-col gap-3 sm:gap-4 ${userImage ? 'lg:order-2' : ''}`}>

            {/* Before upload: campaign details */}
            {!userImage && (
              <>
                <div className="bg-white border border-[#00240010] rounded-2xl p-5 sm:p-6 shadow-sm">
                  {campaign.description && (
                    <p className="text-primary/70 text-sm leading-relaxed mb-5">{campaign.description}</p>
                  )}
                  {creatorProfile && (
                    <Link href={creatorProfile.username ? `/user/${creatorProfile.username}` : '#'}
                      className="flex items-center gap-3 hover:opacity-70 transition-opacity">
                      {creatorAvatarSrc ? (
                        <img src={creatorAvatarSrc} alt={creatorProfile.displayName || ''} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-semibold">{(creatorProfile.displayName || 'U')[0].toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-primary">{creatorProfile.displayName || 'Anonymous'}</p>
                        {campaign.createdAt && (
                          <p className="text-xs text-primary/50">
                            Created {(campaign.createdAt.toDate ? campaign.createdAt.toDate() : new Date(campaign.createdAt)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </Link>
                  )}
                </div>

                {user && campaign.createdBy === user.uid && (
                  <div className="bg-white border border-[#00240010] rounded-2xl p-5 sm:p-6 shadow-sm">
                    <button onClick={() => setShowQRCode(!showQRCode)} className="w-full flex items-center justify-between text-left">
                      <h3 className="text-sm font-semibold text-primary">Campaign QR Code</h3>
                      <span className="text-xs text-primary/50">{showQRCode ? 'Hide' : 'Show'}</span>
                    </button>
                    {showQRCode && (
                      <div className="mt-4">
                        <p className="text-xs text-primary/60 mb-3">Share your campaign with a QR code</p>
                        <CampaignQRCode slug={campaign.slug} campaignName={campaign.campaignName} size={150} />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* After upload: controls */}
            {userImage && (
              <>
                {/* Photo action buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 bg-white border border-[#00240015] hover:border-[#00240030] active:scale-[0.98] text-primary px-4 py-3 rounded-xl font-medium text-sm transition-all shadow-sm"
                  >
                    <PhotoIcon className="w-4 h-4" />
                    Change Photo
                  </button>
                  <button
                    onClick={() => { if (userImage) { setOriginalImage(userImage); setShowCropModal(true) } }}
                    className="flex items-center justify-center gap-2 bg-white border border-[#00240015] hover:border-[#00240030] active:scale-[0.98] text-primary px-4 py-3 rounded-xl font-medium text-sm transition-all shadow-sm"
                  >
                    <ScissorsIcon className="w-4 h-4" />
                    Crop & Adjust
                  </button>
                </div>

                {/* Zoom & download card */}
                <div className="bg-white border border-[#00240010] rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-primary mb-4">Position & Download</h3>

                  {/* Zoom */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-primary">Zoom</label>
                      <span className="text-xs text-primary/50 tabular-nums">{zoomPct}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleZoom(-0.1)} aria-label="Zoom out"
                        className="p-2 hover:bg-[#00240008] active:scale-95 rounded-lg transition-all flex-shrink-0">
                        <MagnifyingGlassMinusIcon className="h-4 w-4 text-primary" />
                      </button>
                      <input type="range" min="25" max="400" value={zoomPct}
                        onChange={(e) => setTransform(prev => ({ ...prev, scale: parseInt(e.target.value) / 100 }))}
                        className="flex-1 h-2 rounded-xl appearance-none cursor-pointer slider touch-none"
                        style={{ background: sliderFill }}
                      />
                      <button onClick={() => handleZoom(0.1)} aria-label="Zoom in"
                        className="p-2 hover:bg-[#00240008] active:scale-95 rounded-lg transition-all flex-shrink-0">
                        <MagnifyingGlassPlusIcon className="h-4 w-4 text-primary" />
                      </button>
                    </div>
                  </div>

                  {/* Reset */}
                  <button onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#00240015] hover:border-[#00240030] active:scale-[0.98] text-primary rounded-xl text-sm font-medium transition-all mb-4 shadow-sm">
                    <ArrowPathIcon className="w-4 h-4" />
                    Reset Position
                  </button>

                  <p className="text-xs text-primary/40 text-center mb-4">Drag to move • Pinch or slider to zoom</p>

                  <div className="border-t border-[#00240010] mb-4" />

                  {/* Download */}
                  <button onClick={handleDownload} disabled={processing}
                    className="w-full bg-secondary hover:bg-secondary/90 active:scale-[0.98] text-primary px-6 py-3.5 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-sm">
                    {processing ? (
                      <><div className="w-5 h-5 rounded-full border-2 border-primary/20 border-t-primary animate-spin" /><span>Processing…</span></>
                    ) : (
                      <><ArrowDownTrayIcon className="h-5 w-5" /><span>Download Image</span></>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {originalImage && (
        <ImageCropModal
          isOpen={showCropModal}
          onClose={() => setShowCropModal(false)}
          image={originalImage}
          onCropComplete={handleCropComplete}
        />
      )}

      <AlertDialog
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
      />
    </div>
  )
}
