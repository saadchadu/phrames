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
  onCropComplete: (croppedImage: string) => void
}

export default function ImageCropModal({
  isOpen,
  onClose,
  image,
  onCropComplete
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  const [processing, setProcessing] = useState(false)
  const { alertState, showAlert, closeAlert } = useDialog()

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onCropCompleteCallback = useCallback(
    (_croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

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

      // Render adjusted cropped image locally to WebP
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

      // Render directly at the exact resolution of the requested cropped area
      canvas.width = croppedAreaPixels.width
      canvas.height = croppedAreaPixels.height

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`

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

      // Retain max quality PNG or WebP with 1.0 quality
      const dataUrl = canvas.toDataURL('image/webp', 1.0)
      onCropComplete(dataUrl)
      onClose()
    } catch (error) {
      console.error('Error cropping image:', error)
      showAlert({
        title: 'Apply Failed',
        message: 'Failed to process image. Please try again.',
        type: 'error',
      })
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
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
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

                  {/* Body - 2 Columns */}
                  <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto overflow-x-hidden min-h-0">

                    {/* Left: Cropper Container (70%) */}
                    <div className="w-full lg:w-[70%] p-6 bg-white flex flex-col border-b lg:border-b-0 lg:border-r border-[#00240010] min-h-[400px]">
                      <div className="relative w-full flex-1 rounded-xl overflow-hidden shadow-sm border border-[#00240010] bg-[#00240005]">
                        <Cropper
                          image={image}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
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
                    <div className="w-full lg:w-[30%] p-6 flex flex-col bg-white">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Adjustments</h4>
                        <button
                          onClick={handleReset}
                          disabled={processing}
                          className="text-xs text-primary/60 hover:text-primary flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          <ArrowPathIcon className="h-3.5 w-3.5" /> Reset
                        </button>
                      </div>

                      <div className="space-y-6">
                        {/* Zoom Slider */}
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-primary">Zoom</label>
                            <span className="text-sm text-primary/70">{Math.round(zoom * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="100" max="300"
                            value={Math.round(zoom * 100)}
                            onChange={(e) => setZoom(Number(e.target.value) / 100)}
                            className="w-full h-2 bg-[#00240010] rounded-xl appearance-none cursor-pointer slider touch-none"
                            style={{
                              background: `linear-gradient(to right, #00dd78 0%, #00dd78 ${((zoom * 100 - 100) / 200) * 100}%, #00240010 ${((zoom * 100 - 100) / 200) * 100}%, #00240010 100%)`
                            }}
                            disabled={processing}
                          />
                        </div>

                        {/* Brightness Slider */}
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-primary">Brightness</label>
                            <span className="text-sm text-primary/70">{brightness}%</span>
                          </div>
                          <input
                            type="range"
                            min="0" max="200"
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className="w-full h-2 bg-[#00240010] rounded-xl appearance-none cursor-pointer slider touch-none"
                            style={{
                              background: `linear-gradient(to right, #00dd78 0%, #00dd78 ${brightness / 2}%, #00240010 ${brightness / 2}%, #00240010 100%)`
                            }}
                            disabled={processing}
                          />
                        </div>

                        {/* Contrast Slider */}
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-primary">Contrast</label>
                            <span className="text-sm text-primary/70">{contrast}%</span>
                          </div>
                          <input
                            type="range"
                            min="0" max="200"
                            value={contrast}
                            onChange={(e) => setContrast(Number(e.target.value))}
                            className="w-full h-2 bg-[#00240010] rounded-xl appearance-none cursor-pointer slider touch-none"
                            style={{
                              background: `linear-gradient(to right, #00dd78 0%, #00dd78 ${contrast / 2}%, #00240010 ${contrast / 2}%, #00240010 100%)`
                            }}
                            disabled={processing}
                          />
                        </div>

                        {/* Saturation Slider */}
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-primary">Saturation</label>
                            <span className="text-sm text-primary/70">{saturation}%</span>
                          </div>
                          <input
                            type="range"
                            min="0" max="200"
                            value={saturation}
                            onChange={(e) => setSaturation(Number(e.target.value))}
                            className="w-full h-2 bg-[#00240010] rounded-xl appearance-none cursor-pointer slider touch-none"
                            style={{
                              background: `linear-gradient(to right, #00dd78 0%, #00dd78 ${saturation / 2}%, #00240010 ${saturation / 2}%, #00240010 100%)`
                            }}
                            disabled={processing}
                          />
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
