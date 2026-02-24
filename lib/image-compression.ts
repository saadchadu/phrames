/**
 * Client-side image compression utilities
 * Optimizes profile images before Firebase upload
 */

export interface CompressionOptions {
  maxWidth: number
  maxHeight: number
  maxSizeKB: number
  quality: number
  format: 'webp' | 'jpeg' | 'png'
}

export const DEFAULT_PROFILE_COMPRESSION: CompressionOptions = {
  maxWidth: 500,
  maxHeight: 500,
  maxSizeKB: 300,
  quality: 0.85,
  format: 'webp'
}

/**
 * Compress and convert image to WebP format
 * @param file Original image file
 * @param options Compression options
 * @returns Compressed File object
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = DEFAULT_PROFILE_COMPRESSION
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Reject files larger than 5MB before processing
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('File size must be less than 5MB'))
      return
    }

    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    img.onload = () => {
      try {
        // Calculate dimensions maintaining aspect ratio
        let { width, height } = img
        
        if (width > options.maxWidth || height > options.maxHeight) {
          const ratio = Math.min(options.maxWidth / width, options.maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height)

        // Helper function to convert with specific quality
        const convertToBlob = (quality: number): Promise<Blob | null> => {
          return new Promise((resolveBlob) => {
            canvas.toBlob(
              (blob) => resolveBlob(blob),
              `image/${options.format}`,
              quality
            )
          })
        }

        // Try compression with initial quality
        convertToBlob(options.quality).then(async (blob) => {
          if (!blob) {
            URL.revokeObjectURL(img.src)
            reject(new Error('Failed to compress image'))
            return
          }

          // If size is too large, try with lower quality
          if (blob.size > options.maxSizeKB * 1024) {
            const lowerQuality = Math.max(0.5, options.quality - 0.2)
            const retryBlob = await convertToBlob(lowerQuality)
            
            if (!retryBlob) {
              URL.revokeObjectURL(img.src)
              reject(new Error('Failed to compress image'))
              return
            }

            // If still too large, try even lower quality
            if (retryBlob.size > options.maxSizeKB * 1024) {
              const finalQuality = Math.max(0.3, lowerQuality - 0.2)
              const finalBlob = await convertToBlob(finalQuality)
              
              if (!finalBlob) {
                URL.revokeObjectURL(img.src)
                reject(new Error('Failed to compress image'))
                return
              }

              blob = finalBlob
            } else {
              blob = retryBlob
            }
          }

          const compressedFile = new File(
            [blob],
            `${file.name.split('.')[0]}.webp`,
            { type: 'image/webp' }
          )

          URL.revokeObjectURL(img.src)
          resolve(compressedFile)
        }).catch((error) => {
          URL.revokeObjectURL(img.src)
          reject(error)
        })
      } catch (error) {
        URL.revokeObjectURL(img.src)
        reject(error)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Validate image file before upload
 */
export function validateProfileImage(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please select a JPG, PNG, or WEBP image' }
  }

  // Check file size (5MB max before compression)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'Image size must be less than 5MB' }
  }

  return { valid: true }
}

/**
 * Get image dimensions
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image'))
    }
    img.src = URL.createObjectURL(file)
  })
}
