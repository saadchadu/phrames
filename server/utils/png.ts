import sharp from 'sharp'

export interface ImageInfo {
  width: number
  height: number
  hasAlpha: boolean
  format: string
  sizeBytes: number
}

export async function validatePngWithAlpha(buffer: Buffer): Promise<ImageInfo> {
  try {
    const image = sharp(buffer)
    const metadata = await image.metadata()
    
    if (metadata.format !== 'png') {
      throw new Error('File must be a PNG image')
    }
    
    if (!metadata.hasAlpha) {
      throw new Error('PNG must have transparency (alpha channel)')
    }
    
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      hasAlpha: metadata.hasAlpha,
      format: metadata.format,
      sizeBytes: buffer.length
    }
  } catch (error) {
    throw new Error(`Invalid PNG: ${error.message}`)
  }
}

export async function createThumbnail(buffer: Buffer, maxSize: number = 300): Promise<Buffer> {
  return await sharp(buffer)
    .resize(maxSize, maxSize, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .png()
    .toBuffer()
}

export function generateAssetKey(userId: string, type: 'frame' | 'thumb', extension: string = 'png'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${type}s/${userId}/${timestamp}-${random}.${extension}`
}