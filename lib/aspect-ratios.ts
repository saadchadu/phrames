export type AspectRatio = '1:1' | '4:5' | '3:4'

export interface AspectRatioDimensions {
  width: number
  height: number
  label: string
  description: string
}

export const ASPECT_RATIOS: Record<AspectRatio, AspectRatioDimensions> = {
  '1:1': {
    width: 1080,
    height: 1080,
    label: 'Square',
    description: 'Perfect for Instagram posts and profile pictures'
  },
  '4:5': {
    width: 1080,
    height: 1350,
    label: 'Portrait',
    description: 'Great for Instagram stories and vertical content'
  },
  '3:4': {
    width: 1080,
    height: 1440,
    label: 'Portrait',
    description: 'Classic portrait orientation for photos'
  }
}

export function getAspectRatioDimensions(aspectRatio: AspectRatio): AspectRatioDimensions {
  return ASPECT_RATIOS[aspectRatio]
}

export function getCanvasDimensions(aspectRatio: AspectRatio, baseSize: number = 400): { width: number; height: number } {
  const ratio = ASPECT_RATIOS[aspectRatio]
  
  if (aspectRatio === '1:1') {
    // For square, use baseSize for both dimensions
    return {
      width: baseSize,
      height: baseSize
    }
  } else {
    // For portrait ratios (4:5, 3:4), use baseSize as width and calculate height
    const scale = baseSize / ratio.width
    return {
      width: baseSize,
      height: Math.round(ratio.height * scale)
    }
  }
}

export function detectAspectRatio(width: number, height: number, tolerance: number = 0.01): AspectRatio | null {
  const ratio = width / height
  
  if (Math.abs(ratio - 1) < tolerance) {
    return '1:1'
  } else if (Math.abs(ratio - (4/5)) < tolerance) {
    return '4:5'
  } else if (Math.abs(ratio - (3/4)) < tolerance) {
    return '3:4'
  }
  
  return null
}