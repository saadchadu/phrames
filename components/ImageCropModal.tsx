'use client'

import { Fragment, useState, useCallback, useEffect } from 'react'
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
}

export interface CropMeta {
  region: { x: number; y: number; width: number; height: number }
  brightness: number
  contrast: number
  saturation: number
}

const DEFAULT_W = 4
const DEFAULT_H = 3
const MIN_SIZE = 1
const MAX_SIZE = 99

export default function ImageCropModal({
  isOpen,
  onClose,
  image,
  onCropComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  const [cropW, setCropW] = useState(DEFAULT_W)
  const [cropH, setCropH] = useState(DEFAULT_H)
  const [inputW, setInputW] = useState(String(DEFAULT_W))
  const [inputH, setInputH] = useState(String(DEFAULT_H))

  const { alertState, showAlert, closeAlert } = useDialog()

  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setBrightness(100)
      setContrast(100)
      setSaturation(100)
      setCropW(DEFAULT_W)
      setCropH(DEFAULT_H)
      setInputW(String(DEFAULT_W))
      setInputH(String(DEFAULT_H))
    }
  }, [isOpen])

  const onCropChange = useCallback((c: { x: number; y: number }) => setCrop(c), [])
  const onZoomChange = useCallback((z: number) => setZoom(z), [])
  const onCropCompleteCallback = useCallback(
    (_area: any, areaPx: any) => setCroppedAreaPixels(areaPx),
    []
  )

  const commitW = (val: string) => {
    const n = Math.min(MAX_SIZE, Math.max(MIN_SIZE, parseInt(val) || MIN_SIZE))
    setCropW(n); setInputW(String(n)); setCrop({ x: 0, y: 0 })
  }
  const commitH = (val: string) => {
    const n = Math.min(MAX_SIZE, Math.max(MIN_SIZE, parseInt(val) || MIN_SIZE))
    setCropH(n); setInputH(String(n)); setCrop({ x: 0, y: 0 })
  }

  const handleReset = () => {
    setZoom(1); setCrop({ x: 0, y: 0 })
    setBrightness(100); setContrast(100); setSaturation(100)
    setCropW(DEFAULT_W); setCropH(DEFAULT_H)
    setInputW(String(DEFAULT_W)); setInputH(String(DEFAULT_H))
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

      const hasAdjustments = brightness !== 100 || contrast !== 100 || saturation !== 100
      if (hasAdjustments) {
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
      }

      ctx.drawImage(
        userImg,
        croppedAreaPixels.x, croppedAreaPixels.y,
        croppedAreaPixels.width, croppedAreaPixels.height,
        0, 0,
        croppedAreaPixels.width, croppedAreaPixels.height
      )

      const dataUrl = canvas.toDataURL('image/png')
      onCropComplete(dataUrl, {
        region: {
          x: croppedAreaPixels.x, y: croppedAreaPixels.y,
          width: croppedAreaPixels.width, height: croppedAreaPixels.height,
        },
        brightness, contrast, saturation,
      })
      onClose()
    } catch (error) {
      console.error('Error cropping image:', error)
      showAlert({ title: 'Apply Failed', message: 'Failed to process image. Please try again.', type: 'error' })
    } finally {
      setProcessing(false)
    }
  }

  const sliderBg = (pct: number) =>
    `linear-gradient(to right, #00dd78 0%, #00dd78 ${pct}%, #00240010 ${pct}%, #00240010 100%)`

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => !processing && onClose()}>

          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200" enterFrom="opacity-0 translate-y-2 scale-95" enterTo="opacity-100 translate-y-0 scale-100"
                leave="ease-in duration-150" leaveFrom="opacity-100 translate-y-0 scale-100" leaveTo="opacity-0 translate-y-2 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#00240010]">

                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#00240010]">
                    <Dialog.Title as="h3" className="text-lg font-semibold text-primary">
                      Adjust Image
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      disabled={processing}
                      className="text-primary/40 hover:text-primary transition-colors p-1.5 rounded-full hover:bg-[#00240008] disabled:opacity-40"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex flex-col sm:flex-row">

                    {/* Crop canvas — fluid width, fixed height on desktop, shorter on mobile */}
                    <div className="relative bg-[#111] flex-shrink-0 w-full sm:w-auto" style={{ height: 'min(420px, 55vw)' }}>
                      <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={cropW / cropH}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropCompleteCallback}
                        objectFit="contain"
                        showGrid={true}
                        zoomWithScroll={true}
                        restrictPosition={false}
                        minZoom={0.5}
                        maxZoom={4}
                        style={{
                          containerStyle: { width: '100%', height: '100%', background: '#111' },
                          cropAreaStyle: {
                            border: '2px solid #00dd78',
                            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
                          },
                          mediaStyle: {
                            filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                          },
                        }}
                      />
                    </div>

                    {/* Right panel */}
                    <div className="w-full sm:w-52 bg-white border-t sm:border-t-0 sm:border-l border-[#00240010] flex flex-col p-5 gap-5">

                      {/* Crop size */}
                      <div>
                        <p className="text-[10px] font-semibold text-primary/40 uppercase tracking-widest mb-3">Aspect Ratio (W : H)</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] text-primary/50 mb-1 block">W</label>
                            <input
                              type="number" min={MIN_SIZE} max={MAX_SIZE}
                              value={inputW}
                              onChange={(e) => setInputW(e.target.value)}
                              onBlur={(e) => commitW(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && commitW(inputW)}
                              className="w-full border border-[#00240020] rounded-xl px-2 py-1.5 text-sm text-primary text-center focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                            />
                          </div>
                          <span className="text-primary/30 mt-4 text-sm">×</span>
                          <div className="flex-1">
                            <label className="text-[10px] text-primary/50 mb-1 block">H</label>
                            <input
                              type="number" min={MIN_SIZE} max={MAX_SIZE}
                              value={inputH}
                              onChange={(e) => setInputH(e.target.value)}
                              onBlur={(e) => commitH(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && commitH(inputH)}
                              className="w-full border border-[#00240020] rounded-xl px-2 py-1.5 text-sm text-primary text-center focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-[#00240010]" />

                      {/* Zoom */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-[10px] font-semibold text-primary/40 uppercase tracking-widest">Zoom</span>
                          <span className="text-xs text-primary/50">{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                          type="range" min={100} max={300} value={Math.round(zoom * 100)}
                          onChange={(e) => setZoom(Number(e.target.value) / 100)}
                          disabled={processing}
                          className="w-full h-2 rounded-xl appearance-none cursor-pointer slider"
                          style={{ background: sliderBg(((zoom - 1) / 2) * 100) }}
                        />
                      </div>

                      <div className="border-t border-[#00240010]" />

                      {/* Adjustments */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-semibold text-primary/40 uppercase tracking-widest">Adjustments</span>
                          <button
                            onClick={handleReset}
                            disabled={processing}
                            className="text-[10px] text-primary/40 hover:text-primary flex items-center gap-1 transition-colors"
                          >
                            <ArrowPathIcon className="h-3 w-3" /> Reset
                          </button>
                        </div>
                        <div className="space-y-4">
                          {[
                            { label: 'Brightness', value: brightness, onChange: setBrightness, trackPct: brightness / 2 },
                            { label: 'Contrast',   value: contrast,   onChange: setContrast,   trackPct: contrast / 2 },
                            { label: 'Saturation', value: saturation, onChange: setSaturation, trackPct: saturation / 2 },
                          ].map(({ label, value, onChange, trackPct }) => (
                            <div key={label}>
                              <div className="flex justify-between mb-1.5">
                                <label className="text-xs font-medium text-primary">{label}</label>
                                <span className="text-xs text-primary/50">{value}%</span>
                              </div>
                              <input
                                type="range" min={0} max={200} value={value}
                                onChange={(e) => onChange(Number(e.target.value))}
                                disabled={processing}
                                className="w-full h-2 rounded-xl appearance-none cursor-pointer slider"
                                style={{ background: sliderBg(trackPct) }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-[#00240010] bg-white">
                    <p className="text-xs text-primary/40">Drag to reposition &bull; Scroll to zoom</p>
                    <div className="flex gap-2">
                      <button
                        onClick={onClose}
                        disabled={processing}
                        className="px-4 py-2 rounded-xl border border-[#00240015] text-primary hover:bg-[#00240005] hover:border-[#00240025] transition-colors text-sm font-semibold disabled:opacity-40"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleApplyCrop}
                        disabled={processing || !croppedAreaPixels}
                        className="px-5 py-2 rounded-xl bg-secondary hover:bg-secondary/90 text-primary transition-colors text-sm font-semibold disabled:opacity-50 flex items-center gap-2 min-w-[110px] justify-center shadow-sm"
                      >
                        {processing ? (
                          <>
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                            Saving...
                          </>
                        ) : 'Apply Crop'}
                      </button>
                    </div>
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
