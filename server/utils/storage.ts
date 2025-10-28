import { getStorage } from 'firebase-admin/storage'
import { getFirebaseAdmin } from './firebase'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

let storageInstance: ReturnType<typeof getStorage> | null = null

// Check if Firebase Storage is available (Blaze plan)
function isFirebaseStorageAvailable(): boolean {
  try {
    const firebase = getFirebaseAdmin()
    return !!firebase
  } catch {
    return false
  }
}

export function getFirebaseStorage() {
  if (storageInstance) {
    return storageInstance
  }

  const firebase = getFirebaseAdmin()
  if (!firebase) {
    throw new Error('Firebase Admin not initialized')
  }

  storageInstance = getStorage(firebase.app)
  return storageInstance
}

// Local storage fallback
async function uploadToLocal(path: string, buffer: Buffer): Promise<string> {
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  const filePath = join(uploadDir, path)
  const fileDir = join(uploadDir, path.split('/').slice(0, -1).join('/'))
  
  // Create directory if it doesn't exist
  if (!existsSync(fileDir)) {
    await mkdir(fileDir, { recursive: true })
  }
  
  // Write file
  await writeFile(filePath, buffer)
  
  // Return the path (will be converted to URL by assetToResponse)
  return path
}

export async function uploadToFirebaseStorage(
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  // Try Firebase Storage first
  if (isFirebaseStorageAvailable()) {
    try {
      const storage = getFirebaseStorage()
      const bucket = storage.bucket()
      
      const file = bucket.file(path)
      
      await file.save(buffer, {
        contentType,
        metadata: {
          contentType
        }
      })

      // Make the file publicly accessible
      await file.makePublic()

      // Return the public URL
      return `https://storage.googleapis.com/${bucket.name}/${path}`
    } catch (error: any) {
      // If Firebase Storage fails (not enabled or Blaze plan not active), fall back to local
      console.warn('Firebase Storage not available, using local storage:', error.message)
      return await uploadToLocal(path, buffer)
    }
  }
  
  // Fall back to local storage
  console.log('Using local storage (Firebase Storage not configured)')
  return await uploadToLocal(path, buffer)
}

export function getFirebaseStoragePublicUrl(path: string): string {
  // Check if this is a local storage path
  if (path.startsWith('/uploads/')) {
    return path
  }
  
  const config = useRuntimeConfig()
  const bucketName = config.public.firebaseStorageBucket
  return `https://storage.googleapis.com/${bucketName}/${path}`
}

export async function deleteFromFirebaseStorage(path: string): Promise<void> {
  if (!isFirebaseStorageAvailable()) {
    return
  }
  
  const storage = getFirebaseStorage()
  const bucket = storage.bucket()
  const file = bucket.file(path)
  
  try {
    await file.delete()
  } catch (error) {
    console.warn(`Failed to delete file ${path}:`, error)
  }
}
