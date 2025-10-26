// @ts-ignore
import exifr from 'exifr'

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
    canvasWidth: 800,
    canvasHeight: 800
  })
  
  const initCanvas = (canvas: HTMLCanvasElement, width: number, height: number) => {
    state.canvas = canvas
    state.ctx = canvas.getContext('2d')
    state.canvasWidth = width
    state.canvasHeight = height
    
    canvas.width = width
    canvas.height = height
    
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
        state.frameImage = img
        resolve()
      }
      img.onerror = reject
      img.src = url
    })
  }
  
  const loadUserImage = async (file: File): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Read EXIF data for orientation
        let orientation = 1
        try {
          const exifData = await exifr(file)
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
          correctedImg.onload = () => {
            state.userImage = correctedImg
            resetTransform()
            resolve()
          }
          correctedImg.src = tempCanvas.toDataURL()
        }
        img.onerror = reject
        img.src = URL.createObjectURL(file)
      } catch (error) {
        reject(error)
      }
    })
  }
  
  const resetTransform = () => {
    if (!state.userImage || !state.frameImage) return
    
    const frameAspect = state.frameImage.width / state.frameImage.height
    const userAspect = state.userImage.width / state.userImage.height
    
    // Scale to fit the frame
    if (userAspect > frameAspect) {
      // User image is wider, scale to height
      state.scale = state.canvasHeight / state.userImage.height
    } else {
      // User image is taller, scale to width
      state.scale = state.canvasWidth / state.userImage.width
    }
    
    // Center the image
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
    
    // Clear canvas
    state.ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight)
    
    // Draw user image (background)
    if (state.userImage) {
      state.ctx.drawImage(
        state.userImage,
        state.offsetX,
        state.offsetY,
        state.userImage.width * state.scale,
        state.userImage.height * state.scale
      )
    }
    
    // Draw frame (foreground)
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
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    link.click()
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
    downloadImage
  }
}