'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline'

interface ImageCropEditorProps {
  image: string
  onCropComplete: (croppedAreaPixels: any) => void
  aspectRatio?: number
}

export default function ImageCropEditor({ 
  image, 
  onCropComplete,
  aspectRatio = 1 
}: ImageCropEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropChange = useCallback((crop: any) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onCropCompleteCallback = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels)
      onCropComplete(croppedAreaPixels)
    },
    [onCropComplete]
  )

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 1))
  }

  return (
    <div className="relative w-full h-full">
      {/* Cropper */}
      <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteCallback}
          objectFit="contain"
          showGrid={true}
          style={{
            containerStyle: {
              width: '100%',
              height: '100%',
              backgroundColor: '#f3f4f6'
            },
            cropAreaStyle: {
              border: '2px solid #00dd78',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
            }
          }}
        />
      </div>

      {/* Zoom Controls */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-primary">Zoom</label>
          <span className="text-sm text-primary/70 font-semibold">
            {Math.round(zoom * 100)}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleZoomOut}
            className="p-2.5 hover:bg-gray-100 active:scale-95 rounded-xl transition-all flex-shrink-0"
            aria-label="Zoom out"
          >
            <MagnifyingGlassMinusIcon className="h-5 w-5 text-primary" />
          </button>
          
          <input
            type="range"
            min="100"
            max="300"
            value={Math.round(zoom * 100)}
            onChange={(e) => setZoom(parseInt(e.target.value) / 100)}
            className="flex-1 h-2 bg-gray-200 rounded-xl appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #00dd78 0%, #00dd78 ${((zoom * 100 - 100) / (300 - 100)) * 100}%, #e5e7eb ${((zoom * 100 - 100) / (300 - 100)) * 100}%, #e5e7eb 100%)`
            }}
          />
          
          <button
            onClick={handleZoomIn}
            className="p-2.5 hover:bg-gray-100 active:scale-95 rounded-xl transition-all flex-shrink-0"
            aria-label="Zoom in"
          >
            <MagnifyingGlassPlusIcon className="h-5 w-5 text-primary" />
          </button>
        </div>
      </div>

      <p className="text-sm text-primary/60 text-center mt-3">
        Drag to reposition • Pinch or use slider to zoom
      </p>
    </div>
  )
}

// Helper function to create cropped image
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: any,
  rotation = 0
): Promise<string> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  const maxSize = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  canvas.width = safeArea
  canvas.height = safeArea

  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-safeArea / 2, -safeArea / 2)

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  )

  const data = ctx.getImageData(0, 0, safeArea, safeArea)

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  )

  return canvas.toDataURL('image/jpeg', 0.95)
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
}
