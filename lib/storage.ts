import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'
import { detectAspectRatio, getAspectRatioDimensions, type AspectRatio } from './aspect-ratios'

export const uploadImage = async (file: File, path: string): Promise<string | null> => {
  try {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    return null
  }
}

export const deleteImage = async (path: string): Promise<boolean> => {
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
    return true
  } catch (error) {
    return false
  }
}

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (file.type !== 'image/png') {
    return { valid: false, error: 'Only PNG files are allowed' }
  }
  
  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024 // 10MB in bytes
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }
  
  return { valid: true }
}

export const checkImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export const checkImageTransparency = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      try {
        // Create a canvas to analyze the image
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        // Draw the image
        ctx.drawImage(img, 0, 0)
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // Check for any transparent pixels (alpha < 255)
        let hasTransparency = false
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) {
            hasTransparency = true
            break
          }
        }
        
        // Clean up
        URL.revokeObjectURL(img.src)
        
        resolve(hasTransparency)
      } catch (error) {
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

export const validateFrameImage = async (file: File): Promise<{ valid: boolean; error?: string; aspectRatio?: AspectRatio }> => {
  // First check basic file validation
  const basicValidation = validateImageFile(file)
  if (!basicValidation.valid) {
    return basicValidation
  }
  
  try {
    // Check dimensions
    const dimensions = await checkImageDimensions(file)
    
    // Detect aspect ratio
    const detectedAspectRatio = detectAspectRatio(dimensions.width, dimensions.height)
    
    if (!detectedAspectRatio) {
      return { 
        valid: false, 
        error: 'Image must have a supported aspect ratio: 1:1 (square), 4:5 (portrait), or 3:4 (portrait).' 
      }
    }
    
    // Get minimum dimensions for this aspect ratio
    const { width: minWidth, height: minHeight } = getAspectRatioDimensions(detectedAspectRatio)
    
    // Check minimum dimensions based on aspect ratio
    if (dimensions.width < minWidth || dimensions.height < minHeight) {
      return { 
        valid: false, 
        error: `Image must be at least ${minWidth}x${minHeight} pixels for ${detectedAspectRatio} aspect ratio` 
      }
    }
    
    // Check for transparency
    const hasTransparency = await checkImageTransparency(file)
    if (!hasTransparency) {
      return { 
        valid: false, 
        error: 'Image must have transparent areas. Please upload a PNG with transparency where the user photo should appear.' 
      }
    }
    
    return { valid: true, aspectRatio: detectedAspectRatio }
  } catch (error) {
    return { valid: false, error: 'Error validating image. Please try again.' }
  }
}