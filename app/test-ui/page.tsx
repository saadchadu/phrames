'use client'

import { useState, useRef, useEffect } from 'react'

// Prevent static generation for this test page
export const dynamic = 'force-dynamic'

export default function TestUIPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null)
  const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [imageScale, setImageScale] = useState(1)
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  // Load frame image
  useEffect(() => {
    const img = new Image()
    img.onload = () => setFrameImage(img)
    img.src = createFrameDataURL()
  }, [])

  const createFrameDataURL = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return ''

    ctx.clearRect(0, 0, 400, 400)
    
    // Draw main frame - turquoise
    ctx.fillStyle = '#2dd4bf'
    ctx.beginPath()
    ctx.roundRect(0, 0, 400, 400, 24)
    ctx.fill()
    
    // Draw purple sections
    ctx.fillStyle = '#9333ea'
    
    // Left vertical strip
    ctx.beginPath()
    ctx.roundRect(32, 32, 64, 320, 8)
    ctx.fill()
    
    // Top horizontal strip
    ctx.beginPath()
    ctx.roundRect(96, 32, 192, 64, 8)
    ctx.fill()
    
    // Right vertical strip
    ctx.beginPath()
    ctx.roundRect(336, 32, 64, 128, 8)
    ctx.fill()
    
    // Create transparent area for photo
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.roundRect(96, 96, 192, 192, 8)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
    
    return canvas.toDataURL()
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          setUserImage(img)
          setIsImageLoaded(true)
          const scale = Math.max(400 / img.width, 400 / img.height)
          setImageScale(scale)
          setImagePosition({ x: 0, y: 0 })
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, 400, 400)

    // Draw user image first (background)
    if (userImage) {
      ctx.save()
      ctx.translate(200 + imagePosition.x, 200 + imagePosition.y)
      ctx.scale(imageScale, imageScale)
      ctx.drawImage(userImage, -userImage.width / 2, -userImage.height / 2)
      ctx.restore()
    }

    // Draw frame on top
    if (frameImage) {
      ctx.drawImage(frameImage, 0, 0)
    }
  }

  useEffect(() => {
    drawCanvas()
  }, [userImage, frameImage, imagePosition, imageScale])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isImageLoaded) return
    setIsDragging(true)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left - imagePosition.x,
        y: e.clientY - rect.top - imagePosition.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isImageLoaded) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setImagePosition({
        x: e.clientX - rect.left - dragStart.x,
        y: e.clientY - rect.top - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoom = (delta: number) => {
    setImageScale(prev => Math.max(0.1, Math.min(3, prev + delta)))
  }

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const highResCanvas = document.createElement('canvas')
    highResCanvas.width = 1080
    highResCanvas.height = 1080
    const ctx = highResCanvas.getContext('2d')
    if (!ctx) return

    const scaleFactor = 1080 / 400

    if (userImage) {
      ctx.save()
      ctx.translate(
        (200 + imagePosition.x) * scaleFactor,
        (200 + imagePosition.y) * scaleFactor
      )
      ctx.scale(imageScale * scaleFactor, imageScale * scaleFactor)
      ctx.drawImage(userImage, -userImage.width / 2, -userImage.height / 2)
      ctx.restore()
    }

    if (frameImage) {
      ctx.drawImage(frameImage, 0, 0, 1080, 1080)
    }

    const link = document.createElement('a')
    link.download = 'framed-photo.png'
    link.href = highResCanvas.toDataURL()
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-8">
        {/* Frame */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className={`rounded-3xl ${isImageLoaded ? 'cursor-move' : 'cursor-default'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        {/* Upload Button */}
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <div className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-full flex items-center space-x-3 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-lg font-medium">Choose Your Photo</span>
          </div>
        </label>

        {/* Simple controls when image loaded */}
        {isImageLoaded && (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleZoom(-0.1)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                -
              </button>
              <span className="text-white text-sm min-w-[50px] text-center">
                {Math.round(imageScale * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.1)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                +
              </button>
            </div>
            
            <button
              onClick={downloadImage}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full"
            >
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  )
}