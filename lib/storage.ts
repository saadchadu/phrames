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