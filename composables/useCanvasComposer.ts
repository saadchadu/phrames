// @ts-ignore
import * as exifr from 'exifr'

const MAX_EXPORT_DIMENSION = 2048
const MAX_USER_DIMENSION = 4096

interface ComposerState {
  canvas: HTMLCanvasElement | null
  ctx: CanvasRenderingContext2D | null
  frameImage: HTMLImageElement | null
  userImage: HTMLImageElement | null
  scale: number
  offsetX: number
  offsetY: number
  canvasWidth: number
  canvasHeight: number
  frameScale: number
  frameOriginalWidth: number
  frameOriginalHeight: number
}

export const useCanvasComposer = () => {
  const state = reactive<ComposerState>({
    canvas: null,
    ctx: null,
    frameImage: null,
    userImage: null,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    canvasWidth: 1080,
    canvasHeight: 1080,
    frameScale: 1,
    frameOriginalWidth: 1080,
    frameOriginalHeight: 1080
  })
  
  const initCanvas = (canvas: HTMLCanvasElement, frameWidth: number, frameHeight: number) => {
    state.canvas = canvas
    state.ctx = canvas.getContext('2d')
    state.frameOriginalWidth = frameWidth
    state.frameOriginalHeight = frameHeight

    const longestSide = Math.max(frameWidth, frameHeight)
    const scale = longestSide > MAX_EXPORT_DIMENSION ? MAX_EXPORT_DIMENSION / longestSide : 1

    const canvasWidth = Math.round(frameWidth * scale)
    const canvasHeight = Math.round(frameHeight * scale)

    state.canvasWidth = canvasWidth
    state.canvasHeight = canvasHeight
    state.frameScale = scale
    state.scale = 1
    state.offsetX = 0
    state.offsetY = 0
    state.userImage = null

    canvas.width = canvasWidth
    canvas.height = canvasHeight
    canvas.style.width = '100%'
    canvas.style.height = 'auto'
    
    if (state.ctx) {
      state.ctx.imageSmoothingEnabled = true
      state.ctx.imageSmoothingQuality = 'high'
    }
  }
  
  const loadFrameImage = async (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        console.log('Frame image loaded successfully:', url)
        state.frameImage = img
        resolve()
      }
      img.onerror = (error) => {
        console.error('Failed to load frame image:', url, error)
        reject(new Error(`Failed to load frame image: ${url}`))
      }
      console.log('Loading frame image from:', url)
      img.src = url
    })
  }
  
  const loadUserImage = async (file: File): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Read EXIF data for orientation
        let orientation = 1
        try {
          const exifData = await exifr.parse(file)
          orientation = exifData?.Orientation || 1
        } catch (e) {
          // No EXIF data, use default orientation
        }
        
        const img = new Image()
        img.onload = () => {
          // Create a temporary canvas to handle rotation
          const tempCanvas = document.createElement('canvas')
          const tempCtx = tempCanvas.getContext('2d')!
          
          let { width, height } = img
          
          // Adjust dimensions based on orientation
          if (orientation >= 5 && orientation <= 8) {
            [width, height] = [height, width]
          }
          
          tempCanvas.width = width
          tempCanvas.height = height
          
          // Apply rotation based on EXIF orientation
          tempCtx.save()
          switch (orientation) {
            case 2:
              tempCtx.scale(-1, 1)
              tempCtx.translate(-width, 0)
              break
            case 3:
              tempCtx.rotate(Math.PI)
              tempCtx.translate(-width, -height)
              break
            case 4:
              tempCtx.scale(1, -1)
              tempCtx.translate(0, -height)
              break
            case 5:
              tempCtx.rotate(Math.PI / 2)
              tempCtx.scale(1, -1)
              break
            case 6:
              tempCtx.rotate(Math.PI / 2)
              tempCtx.translate(0, -height)
              break
            case 7:
              tempCtx.rotate(-Math.PI / 2)
              tempCtx.scale(-1, 1)
              tempCtx.translate(-width, -height)
              break
            case 8:
              tempCtx.rotate(-Math.PI / 2)
              tempCtx.translate(-width, 0)
              break
          }
          
          tempCtx.drawImage(img, 0, 0)
          tempCtx.restore()
          
          // Create new image from corrected canvas
          const correctedImg = new Image()
          correctedImg.onload = async () => {
            try {
              const finalImage = await ensureMaxDimensions(correctedImg)
              state.userImage = finalImage
              resetTransform()
              resolve()
            } catch (innerError) {
              reject(innerError)
            }
          }
          correctedImg.onerror = reject
          correctedImg.src = tempCanvas.toDataURL()
        }
        img.onerror = reject
        img.src = URL.createObjectURL(file)
      } catch (error) {
        reject(error)
      }
    })
  }
  
  const ensureMaxDimensions = async (image: HTMLImageElement): Promise<HTMLImageElement> => {
    const { width, height } = image
    const longestSide = Math.max(width, height)

    if (longestSide <= MAX_USER_DIMENSION) {
      return image
    }

    const scale = MAX_USER_DIMENSION / longestSide
    const targetWidth = Math.round(width * scale)
    const targetHeight = Math.round(height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight)

    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const scaled = new Image()
      scaled.onload = () => resolve(scaled)
      scaled.onerror = reject
      scaled.src = canvas.toDataURL('image/png')
    })
  }
  
  const resetTransform = () => {
    if (!state.userImage) return
    
    const frameAspect = state.canvasWidth / state.canvasHeight
    const userAspect = state.userImage.width / state.userImage.height
    
    if (userAspect > frameAspect) {
      state.scale = state.canvasHeight / state.userImage.height
    } else {
      state.scale = state.canvasWidth / state.userImage.width
    }
    
    state.offsetX = (state.canvasWidth - state.userImage.width * state.scale) / 2
    state.offsetY = (state.canvasHeight - state.userImage.height * state.scale) / 2
    
    render()
  }
  
  const setScale = (newScale: number) => {
    const oldScale = state.scale
    state.scale = Math.max(0.1, Math.min(5, newScale))
    
    // Adjust offset to keep image centered on scale change
    const scaleDiff = state.scale - oldScale
    if (state.userImage) {
      state.offsetX -= (state.userImage.width * scaleDiff) / 2
      state.offsetY -= (state.userImage.height * scaleDiff) / 2
    }
    
    render()
  }
  
  const setOffset = (x: number, y: number) => {
    state.offsetX = x
    state.offsetY = y
    render()
  }
  
  const render = () => {
    if (!state.ctx || !state.canvas) return
    
    state.ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight)
    
    if (state.userImage) {
      state.ctx.drawImage(
        state.userImage,
        state.offsetX,
        state.offsetY,
        state.userImage.width * state.scale,
        state.userImage.height * state.scale
      )
    }
    
    if (state.frameImage) {
      state.ctx.drawImage(state.frameImage, 0, 0, state.canvasWidth, state.canvasHeight)
    }
  }
  
  const exportImage = (format: 'png' | 'jpeg' = 'png', quality: number = 0.9): string => {
    if (!state.canvas) return ''
    
    if (format === 'jpeg') {
      return state.canvas.toDataURL('image/jpeg', quality)
    } else {
      return state.canvas.toDataURL('image/png')
    }
  }
  
  const downloadImage = (filename: string, format: 'png' | 'jpeg' = 'png', quality: number = 0.9) => {
    const dataUrl = exportImage(format, quality)
    if (!dataUrl) return
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    link.click()
  }

  const clearUserImage = () => {
    state.userImage = null
    state.scale = 1
    state.offsetX = 0
    state.offsetY = 0
    render()
  }
  
  return {
    state: readonly(state),
    initCanvas,
    loadFrameImage,
    loadUserImage,
    resetTransform,
    setScale,
    setOffset,
    render,
    exportImage,
    downloadImage,
    clearUserImage
  }
}
