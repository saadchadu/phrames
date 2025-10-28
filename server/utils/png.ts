import sharp from 'sharp'

export interface ImageInfo {
  width: number
  height: number
  hasAlpha: boolean
  format: string
  sizeBytes: number
}

const MIN_DIMENSION = 1080

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

    const width = metadata.width || 0
    const height = metadata.height || 0

    if (!width || !height) {
      throw new Error('Unable to determine image dimensions')
    }

    if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
      throw new Error(`PNG must be at least ${MIN_DIMENSION}px on both sides`)
    }
    
    return {
      width,
      height,
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

export function toAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))
  const divisor = gcd(width, height)
  const ratioWidth = Math.round(width / divisor)
  const ratioHeight = Math.round(height / divisor)
  return `${ratioWidth}:${ratioHeight}`
}
