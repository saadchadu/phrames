'use client'

import { Fragment, useState, useCallback } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import Cropper from 'react-easy-crop'
import { useDialog } from '@/hooks/useDialog'
import AlertDialog from '@/components/ui/AlertDialog'

interface ImageCropModalProps {
  isOpen: boolean
  onClose: () => void
  image: string
  onCropComplete: (croppedImage: string, meta: CropMeta) => void
  frameAspect?: number | null
}

export interface CropMeta {
  region: { x: number; y: number; width: number; height: number }
  brightness: number
  contrast: number
  saturation: number
}

type RatioKey = 'free' | '1:1' | '4:5' | '3:4' | '9:16' | 'custom'

const RATIO_OPTIONS: { key: RatioKey; label: string; value: number | null }[] = [
  { key: 'free', label: 'Free', value: null },
  { key: '1:1', label: '1:1', value: 1 },
  { key: '4:5', label: '4:5', value: 4 / 5 },
  { key: '3:4', label: '3:4', value: 3 / 4 },
  { key: '9:16', label: '9:16', value: 9 / 16 },
  { key: 'custom', label: 'Custom', value: null },
]

function nearestRatioKey(aspect: number | null | undefined): RatioKey {
  if (!aspect) return 'free'
  const tol = 0.02
  if (Math.abs(aspect - 1) < tol) return '1:1'
  if (Math.abs(aspect - 4 / 5) < tol) return '4:5'
  if (Math.abs(aspect - 3 / 4) < tol) return '3:4'
  if (Math.abs(aspect - 9 / 16) < tol) return '9:16'
  return 'custom'
}

export default function ImageCropModal({
  isOpen,
  onClose,
  image,
  onCropComplete,
  frameAspect,
}: ImageCropModalProps) {
  const defaultRatioKey = nearestRatioKey(frameAspect)
  const defaultAspect =
    frameAspect ??
    (defaultRatioKey === 'free' || defaultRatioKey === 'custom'
      ? null
      : RATIO_OPTIONS.find((r) => r.key === defaultRatioKey)?.value ?? null)

  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [processing, setProcessing] = useState(false)

  // Ratio state
  const [ratioKey, setRatioKey] = useState<RatioKey>(defaultRatioKey)
  const [cropAspect, setCropAspect] = useState<number | null>(defaultAspect)
  const [customW, setCustomW] = useState(9)
  const [customH, setCustomH] = useState(16)

  const { alertState, showAlert, closeAlert } = useDialog()

  const onCropChange = useCallback((c: { x: number; y: number }) => setCrop(c), [])
  const onZoomChange = useCallback((z: number) => setZoom(z), [])
  const onCropCompleteCallback = useCallback(
    (_croppedArea: any, croppedAreaPx: any) => setCroppedAreaPixels(croppedAreaPx),
    []
  )

  const handleRatioSelect = (key: RatioKey) => {
    setRatioKey(key)
    if (key === 'free') {
      setCropAspect(null)
    } else if (key === 'custom') {
      setCropAspect(customW / customH)
    } else {
      const opt = RATIO_OPTIONS.find((r) => r.key === key)
      setCropAspect(opt?.value ?? null)
    }
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  const handleCustomChange = (w: number, h: number) => {
    const safeW = Math.max(1, w)
    const safeH = Math.max(1, h)
    setCustomW(safeW)
    setCustomH(safeH)
    if (ratioKey === 'custom') setCropAspect(safeW / safeH)
  }

  const handleReset = () => {
    setZoom(1)
    setCrop({ x: 0, y: 0 })
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
  }

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels) return
    try {
      setProcessing(true)
      const userImg = new Image()
      if (image.startsWith('http')) userImg.crossOrigin = 'anonymous'
      await new Promise<void>((resolve, reject) => {
        userImg.onload = () => resolve()
        userImg.onerror = reject
        userImg.src = image
      })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('No 2d context')

      canvas.width = croppedAreaPixels.width
      canvas.height = croppedAreaPixels.height

      // Only apply filter if any adjustment differs from the neutral default
      const hasAdjustments = brightness !== 100 || contrast !== 100 || saturation !== 100
      if (hasAdjustments) {
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
      }

      ctx.drawImage(
        userImg,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      )

      // PNG is lossless — no quality degradation unlike WebP at any quality level
      const dataUrl = canvas.toDataURL('image/png')
      onCropComplete(dataUrl, {
        region: {
          x: croppedAreaPixels.x,
          y: croppedAreaPixels.y,
          width: croppedAreaPixels.width,
          height: croppedAreaPixels.height,
        },
        brightness,
        contrast,
        saturation,
      })
      onClose()
    } catch (error) {
      console.error('Error cropping image:', error)
      showAlert({ title: 'Apply Failed', message: 'Failed to process image. Please try again.', type: 'error' })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => !processing && onClose()}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="w-full max-w-[1000px] transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all flex flex-col max-h-[90vh]">

                  {/* Header */}
                  <div className="px-6 py-4 flex items-center justify-between border-b border-[#00240010]">
                    <Dialog.Title as="h3" className="text-xl font-semibold text-primary">
                      Adjust Image
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      disabled={processing}
                      className="text-primary/60 hover:text-primary transition-colors p-1 rounded-full hover:bg-[#00240005] disabled:opacity-50"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Body — 2 columns */}
                  <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto overflow-x-hidden min-h-0">

                    {/* Left: Crop area (70%) */}
                    <div className="w-full lg:w-[70%] p-6 bg-white flex flex-col border-b lg:border-b-0 lg:border-r border-[#00240010] min-h-[400px]">
                      <div className="relative w-full flex-1 rounded-xl overflow-hidden shadow-sm border border-[#00240010] bg-[#00240005]">
                        <Cropper
                          image={image}
                          crop={crop}
                          zoom={zoom}
                          aspect={cropAspect ?? undefined}
                          onCropChange={onCropChange}
                          onZoomChange={onZoomChange}
                          onCropComplete={onCropCompleteCallback}
                          objectFit="contain"
                          showGrid={true}
                          style={{
                            containerStyle: { width: '100%', height: '100%' },
                            cropAreaStyle: { border: '2px solid white' },
                            mediaStyle: {
                              filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-primary/60 text-center mt-4 tracking-wider font-medium">
                        Drag to reposition &bull; Scroll to zoom
                      </p>
                    </div>

                    {/* Right: Controls (30%) */}
                    <div className="w-full lg:w-[30%] p-6 flex flex-col bg-white gap-7">

                      {/* ── Crop Shape ── */}
                      <div>
                        <h4 className="text-xs font-semibold text-primary/50 uppercase tracking-widest mb-3">Crop Shape</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {RATIO_OPTIONS.map((opt) => (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => handleRatioSelect(opt.key)}
                              disabled={processing}
                              className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all ${ratioKey === opt.key
                                ? 'bg-secondary/10 border-secondary text-primary'
                                : 'bg-white border-[#00240020] text-primary/50 hover:border-secondary/40 hover:text-primary'
                                }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        {/* Custom ratio W:H inputs */}
                        {ratioKey === 'custom' && (
                          <div className="mt-3 flex items-center gap-2">
                            <input
                              type="number"
                              min={1} max={99}
                              value={customW}
                              onChange={(e) => handleCustomChange(Number(e.target.value), customH)}
                              className="w-full px-3 py-2 border border-[#00240020] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:ring-secondary text-center"
                              placeholder="W"
                            />
                            <span className="text-primary/40 font-bold flex-shrink-0 text-lg">:</span>
                            <input
                              type="number"
                              min={1} max={99}
                              value={customH}
                              onChange={(e) => handleCustomChange(customW, Number(e.target.value))}
                              className="w-full px-3 py-2 border border-[#00240020] rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:ring-secondary text-center"
                              placeholder="H"
                            />
                          </div>
                        )}
                      </div>

                      {/* ── Adjustments ── */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xs font-semibold text-primary/50 uppercase tracking-widest">Adjustments</h4>
                          <button
                            onClick={handleReset}
                            disabled={processing}
                            className="text-xs text-primary/50 hover:text-primary flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <ArrowPathIcon className="h-3.5 w-3.5" /> Reset
                          </button>
                        </div>

                        <div className="space-y-5">
                          {[
                            { label: 'Zoom', value: Math.round(zoom * 100), unit: '%', min: 100, max: 300, onChange: (v: number) => setZoom(v / 100), trackPct: ((zoom * 100 - 100) / 200) * 100 },
                            { label: 'Brightness', value: brightness, unit: '%', min: 0, max: 200, onChange: setBrightness, trackPct: brightness / 2 },
                            { label: 'Contrast', value: contrast, unit: '%', min: 0, max: 200, onChange: setContrast, trackPct: contrast / 2 },
                            { label: 'Saturation', value: saturation, unit: '%', min: 0, max: 200, onChange: setSaturation, trackPct: saturation / 2 },
                          ].map(({ label, value, unit, min, max, onChange, trackPct }) => (
                            <div key={label}>
                              <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-primary">{label}</label>
                                <span className="text-sm text-primary/60">{value}{unit}</span>
                              </div>
                              <input
                                type="range" min={min} max={max} value={value}
                                onChange={(e) => onChange(Number(e.target.value))}
                                className="w-full h-2 rounded-xl appearance-none cursor-pointer slider touch-none"
                                style={{ background: `linear-gradient(to right, #00dd78 0%, #00dd78 ${trackPct}%, #00240010 ${trackPct}%, #00240010 100%)` }}
                                disabled={processing}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-white border-t border-[#00240010] flex justify-end gap-3">
                    <button
                      onClick={onClose}
                      disabled={processing}
                      className="px-5 py-2.5 rounded-xl border border-[#00240010] text-primary hover:bg-[#00240005] hover:border-[#00240020] transition-colors font-semibold shadow-sm disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyCrop}
                      disabled={processing || !croppedAreaPixels}
                      className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-primary transition-colors font-semibold shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                    >
                      {processing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                          <span>Saving...</span>
                        </div>
                      ) : (
                        'Apply Crop'
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <AlertDialog
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </>
  )
}
