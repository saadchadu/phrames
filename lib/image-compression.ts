/**
 * Client-side image compression with Web Worker support.
 *
 * Strategy:
 *  1. Validate file type (PNG, JPG, JPEG) and size (max 3MB).
 *  2. Detect transparency (PNG only).
 *  3. Attempt compression in a Web Worker (OffscreenCanvas) to avoid UI lag.
 *  4. Fall back to main-thread canvas if worker is unavailable (Safari).
 *  5. Output WebP unless the image has transparency → PNG fallback.
 *  6. Never degrade visible quality: quality floor is 0.80.
 */

export interface CompressionOptions {
  maxWidth: number
  maxHeight: number
  maxSizeKB: number
  /** Initial quality (0–1). Will not drop below 0.80. */
  quality: number
  /** Preferred output format. PNG used automatically when transparency detected. */
  format: 'webp' | 'png'
}

export interface CompressionResult {
  file: File
  format: 'webp' | 'png'
  hasTransparency: boolean
  originalSizeKB: number
  compressedSizeKB: number
}

// Profile images: square, moderate size
export const PROFILE_COMPRESSION: CompressionOptions = {
  maxWidth: 500,
  maxHeight: 500,
  maxSizeKB: 300,
  quality: 0.88,
  format: 'webp',
}

// Campaign / frame images: larger, preserve quality
export const FRAME_COMPRESSION: CompressionOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  maxSizeKB: 2048, // 2MB target (uploaded max is 3MB)
  quality: 0.92,
  format: 'webp',
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024 // 3MB hard limit

/** Validate file before any processing. */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only PNG, JPG, or JPEG images are accepted.' }
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { valid: false, error: 'File size must be under 3MB.' }
  }
  return { valid: true }
}

// Keep legacy export name for backward compatibility
export const validateProfileImage = validateImageFile

/** Detect if a PNG file contains any transparent pixels. */
export function detectTransparency(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    // Only PNG can have transparency
    if (file.type !== 'image/png') {
      resolve(false)
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        // Sample a downscaled version for speed
        const scale = Math.min(1, 200 / Math.max(img.width, img.height))
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(false); return }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)

        let transparent = false
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) { transparent = true; break }
        }
        resolve(transparent)
      } catch {
        resolve(false)
      } finally {
        URL.revokeObjectURL(url)
      }
    }

    img.onerror = () => { URL.revokeObjectURL(url); resolve(false) }
    img.src = url
  })
}

/** Get image dimensions from a File. */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => { resolve({ width: img.width, height: img.height }); URL.revokeObjectURL(url) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}

/** Calculate target dimensions preserving aspect ratio. */
function calcTargetDimensions(
  srcW: number, srcH: number,
  maxW: number, maxH: number
): { width: number; height: number } {
  if (srcW <= maxW && srcH <= maxH) return { width: srcW, height: srcH }
  const ratio = Math.min(maxW / srcW, maxH / srcH)
  return { width: Math.round(srcW * ratio), height: Math.round(srcH * ratio) }
}

/**
 * Compress an image using a Web Worker (OffscreenCanvas) when available,
 * falling back to main-thread canvas for Safari.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = PROFILE_COMPRESSION
): Promise<CompressionResult> {
  const validation = validateImageFile(file)
  if (!validation.valid) throw new Error(validation.error)

  const hasTransparency = await detectTransparency(file)
  // Force PNG output when transparency is present to preserve it
  const outputFormat: 'webp' | 'png' = hasTransparency ? 'png' : 'webp'

  const { width: srcW, height: srcH } = await getImageDimensions(file)
  const { width: tgtW, height: tgtH } = calcTargetDimensions(srcW, srcH, options.maxWidth, options.maxHeight)

  const originalSizeKB = Math.round(file.size / 1024)

  // Try Web Worker path first
  const workerResult = await tryWorkerCompression(file, srcW, srcH, tgtW, tgtH, options.quality, outputFormat, hasTransparency)

  let blob: Blob
  let finalFormat: 'webp' | 'png'

  if (workerResult) {
    blob = workerResult.blob
    finalFormat = workerResult.format
  } else {
    // Main-thread fallback (Safari / no OffscreenCanvas)
    const result = await mainThreadCompress(file, srcW, srcH, tgtW, tgtH, options.quality, outputFormat)
    blob = result.blob
    finalFormat = result.format
  }

  const compressedFile = new File(
    [blob],
    `image.${finalFormat}`,
    { type: finalFormat === 'webp' ? 'image/webp' : 'image/png' }
  )

  return {
    file: compressedFile,
    format: finalFormat,
    hasTransparency,
    originalSizeKB,
    compressedSizeKB: Math.round(compressedFile.size / 1024),
  }
}

/** Attempt compression via Web Worker. Returns null if worker unavailable. */
function tryWorkerCompression(
  file: File,
  srcW: number, srcH: number,
  tgtW: number, tgtH: number,
  quality: number,
  format: 'webp' | 'png',
  hasTransparency: boolean
): Promise<{ blob: Blob; format: 'webp' | 'png' } | null> {
  return new Promise((resolve) => {
    try {
      const worker = new Worker('/workers/image-compress.worker.js')

      const timeout = setTimeout(() => {
        worker.terminate()
        resolve(null)
      }, 10_000)

      worker.onmessage = (e) => {
        clearTimeout(timeout)
        worker.terminate()

        if (e.data.fallback || e.data.error) {
          resolve(null)
          return
        }

        resolve({ blob: e.data.blob, format: e.data.format })
      }

      worker.onerror = () => {
        clearTimeout(timeout)
        worker.terminate()
        resolve(null)
      }

      // Read file as ImageData to transfer to worker
      readFileAsImageData(file, srcW, srcH).then((imageData) => {
        if (!imageData) { worker.terminate(); clearTimeout(timeout); resolve(null); return }

        worker.postMessage(
          { imageData: imageData.buffer, width: srcW, height: srcH, targetWidth: tgtW, targetHeight: tgtH, quality, format, hasTransparency },
          [imageData.buffer]
        )
      }).catch(() => {
        clearTimeout(timeout)
        worker.terminate()
        resolve(null)
      })
    } catch {
      resolve(null)
    }
  })
}

/** Read a File into a raw Uint8ClampedArray (RGBA pixel data) via canvas. */
function readFileAsImageData(file: File, width: number, height: number): Promise<Uint8ClampedArray | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(null); return }
        ctx.drawImage(img, 0, 0, width, height)
        const { data } = ctx.getImageData(0, 0, width, height)
        resolve(data)
      } catch {
        resolve(null)
      } finally {
        URL.revokeObjectURL(url)
      }
    }

    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

/** Main-thread canvas compression fallback. */
function mainThreadCompress(
  file: File,
  srcW: number, srcH: number,
  tgtW: number, tgtH: number,
  quality: number,
  format: 'webp' | 'png'
): Promise<{ blob: Blob; format: 'webp' | 'png' }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = tgtW
        canvas.height = tgtH
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas context unavailable')); return }

        ctx.drawImage(img, 0, 0, srcW, srcH, 0, 0, tgtW, tgtH)

        const mimeType = format === 'png' ? 'image/png' : 'image/webp'
        const q = format === 'png' ? undefined : Math.max(0.80, quality)

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url)
          if (!blob) { reject(new Error('Canvas toBlob failed')); return }
          resolve({ blob, format })
        }, mimeType, q)
      } catch (err) {
        URL.revokeObjectURL(url)
        reject(err)
      }
    }

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}

// Legacy export for backward compatibility
export const DEFAULT_PROFILE_COMPRESSION = PROFILE_COMPRESSION
