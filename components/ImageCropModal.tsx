'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import ImageCropEditor, { getCroppedImg } from './ImageCropEditor'
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
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  const { alertState, showAlert, closeAlert } = useDialog()

  const handleCropComplete = (croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels)
  }

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels) return

    try {
      setProcessing(true)
      const croppedImage = await getCroppedImg(image, croppedAreaPixels)
      onCropComplete(croppedImage)
      onClose()
    } catch (error) {
      console.error('Error cropping image:', error)
      showAlert({
        title: 'Crop Failed',
        message: 'Failed to crop image. Please try again.',
        type: 'error',
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-2xl font-bold text-primary leading-tight"
                      >
                        Crop & Adjust Photo
                      </Dialog.Title>
                      <p className="mt-2 text-sm text-primary/70">
                        Position and zoom your photo to fit perfectly
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-primary/60 hover:text-primary transition-colors p-1"
                      disabled={processing}
                      aria-label="Close crop modal"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Crop Editor */}
                  <div className="mb-6">
                    <ImageCropEditor
                      image={image}
                      onCropComplete={handleCropComplete}
                      aspectRatio={1}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      onClick={onClose}
                      disabled={processing}
                      className="px-6 py-3 rounded-xl border border-gray-300 text-primary hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyCrop}
                      disabled={processing || !croppedAreaPixels}
                      className="px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/90 text-primary font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                          <span>Processing...</span>
                        </>
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
