/**
 * Firebase Storage upload utilities with:
 *  - SHA-256 deduplication (hash-based filenames)
 *  - CDN URL construction (img.phrames.app) — never uses getDownloadURL()
 *  - Immutable cache headers for Cloudflare edge caching
 *  - Transparency-aware WebP/PNG selection
 *  - 3MB upload limit enforcement
 */

import { ref, uploadBytes, getMetadata, deleteObject } from 'firebase/storage'
import { storage } from './firebase'
import { hashFile, buildImagePath } from './image-hash'
import { buildCdnUrl } from './cdn'
import { compressImage, validateImageFile, PROFILE_COMPRESSION, FRAME_COMPRESSION } from './image-compression'
import { detectAspectRatio, getAspectRatioDimensions, type AspectRatio } from './aspect-ratios'

// Immutable cache metadata — tells Cloudflare to cache forever
const IMMUTABLE_CACHE: { cacheControl: string; contentType?: string } = {
  cacheControl: 'public, max-age=31536000, immutable',
}

export interface UploadResult {
  url: string
  path: string
  hash: string
  format: 'webp' | 'png'
  deduplicated: boolean
}

/**
 * Core upload function.
 * 1. Compresses the image (Web Worker when available).
 * 2. Hashes the compressed bytes → filename.
 * 3. Checks if the file already exists in Firebase Storage.
 * 4. Uploads only if new; returns CDN URL either way.
 *
 * NEVER calls getDownloadURL(). CDN URL is constructed from the known path.
 */
export async function uploadImageWithDedup(
  file: File,
  compressionPreset: 'profile' | 'frame' = 'profile'
): Promise<UploadResult> {
  const options = compressionPreset === 'frame' ? FRAME_COMPRESSION : PROFILE_COMPRESSION

  // Compress + detect format
  const { file: compressed, format } = await compressImage(file, options)

  // Hash the compressed bytes for deduplication
  const hash = await hashFile(compressed)
  const storagePath = buildImagePath(hash, format)
  const cdnUrl = buildCdnUrl(storagePath)

  // Check if already uploaded (deduplication)
  const storageRef = ref(storage, storagePath)
  let deduplicated = false

  try {
    await getMetadata(storageRef)
    // File exists — reuse CDN URL
    deduplicated = true
  } catch {
    // File does not exist — upload it
    const metadata = {
      ...IMMUTABLE_CACHE,
      contentType: format === 'webp' ? 'image/webp' : 'image/png',
    }
    await uploadBytes(storageRef, compressed, metadata)
  }

  return { url: cdnUrl, path: storagePath, hash, format, deduplicated }
}

/**
 * Upload a profile image.
 * Profile images use a user-scoped path so they can be replaced.
 * The hash-named file is stored under images/ for CDN serving.
 */
export async function uploadProfileImage(file: File): Promise<string | null> {
  try {
    const result = await uploadImageWithDedup(file, 'profile')
    return result.url
  } catch (error) {
    console.error('uploadProfileImage error:', error)
    return null
  }
}

/**
 * Upload a frame/campaign image.
 * Preserves transparency (PNG fallback), higher quality preset.
 */
export async function uploadFrameImage(file: File): Promise<UploadResult | null> {
  try {
    return await uploadImageWithDedup(file, 'frame')
  } catch (error) {
    console.error('uploadFrameImage error:', error)
    return null
  }
}

/**
 * Legacy uploadImage — kept for backward compatibility.
 * Compresses and uploads, returns CDN URL.
 * @param file  The image file to upload
 * @param _path Ignored — path is now hash-based. Kept for API compatibility.
 */
export async function uploadImage(file: File, _path?: string): Promise<string | null> {
  return uploadProfileImage(file)
}

/** Delete an image from Firebase Storage by its storage path. */
export async function deleteImage(path: string): Promise<boolean> {
  try {
    await deleteObject(ref(storage, path))
    return true
  } catch {
    return false
  }
}

// ─── Validation helpers (unchanged API) ──────────────────────────────────────

export { validateImageFile }

export const validateFrameImage = async (
  file: File
): Promise<{ valid: boolean; error?: string; aspectRatio?: AspectRatio; dimensions?: { width: number; height: number } }> => {
  const basic = validateImageFile(file)
  if (!basic.valid) return basic

  try {
    const dimensions = await checkImageDimensions(file)
    const detectedAspectRatio = detectAspectRatio(dimensions.width, dimensions.height)

    if (!detectedAspectRatio) {
      return { valid: false, error: 'Image must have a supported aspect ratio: 1:1, 4:5, 3:4, or 9:16.' }
    }

    const { width: minW, height: minH } = getAspectRatioDimensions(detectedAspectRatio)
    if (dimensions.width < minW || dimensions.height < minH) {
      return {
        valid: false,
        error: `Frame must be at least ${minW}×${minH}px for ${detectedAspectRatio} ratio. Your image is ${dimensions.width}×${dimensions.height}px.`,
      }
    }

    const hasTransparency = await checkImageTransparency(file)
    if (!hasTransparency) {
      return { valid: false, error: 'Image must have transparent areas (PNG with transparency required).' }
    }

    return { valid: true, aspectRatio: detectedAspectRatio, dimensions }
  } catch {
    return { valid: false, error: 'Error validating image. Please try again.' }
  }
}

export const checkImageDimensions = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => { resolve({ width: img.width, height: img.height }); URL.revokeObjectURL(url) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })

export const checkImageTransparency = (file: File): Promise<boolean> =>
  new Promise((resolve, reject) => {
    if (file.type !== 'image/png') { resolve(false); return }
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('No canvas context')); return }
        ctx.drawImage(img, 0, 0)
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let transparent = false
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) { transparent = true; break }
        }
        URL.revokeObjectURL(url)
        resolve(transparent)
      } catch (err) {
        URL.revokeObjectURL(url)
        reject(err)
      }
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
