import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

export const uploadImage = async (file: File, path: string): Promise<string | null> => {
  try {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}

export const deleteImage = async (path: string): Promise<boolean> => {
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
    return true
  } catch (error) {
    console.error('Error deleting image:', error)
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

export const validateFrameImage = async (file: File): Promise<{ valid: boolean; error?: string }> => {
  // First check basic file validation
  const basicValidation = validateImageFile(file)
  if (!basicValidation.valid) {
    return basicValidation
  }
  
  try {
    // Check dimensions
    const dimensions = await checkImageDimensions(file)
    
    // Must be square (1:1 aspect ratio)
    if (dimensions.width !== dimensions.height) {
      return { 
        valid: false, 
        error: 'Image must be square (1:1 aspect ratio). Please upload an image with equal width and height.' 
      }
    }
    
    // Must be at least 1080x1080
    if (dimensions.width < 1080 || dimensions.height < 1080) {
      return { 
        valid: false, 
        error: 'Image must be at least 1080x1080 pixels' 
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
    
    return { valid: true }
  } catch (error) {
    console.error('Error validating frame image:', error)
    return { valid: false, error: 'Error validating image. Please try again.' }
  }
}