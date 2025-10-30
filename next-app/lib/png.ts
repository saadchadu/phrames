import sharp from 'sharp'

export async function validatePngTransparency(buffer: Buffer): Promise<boolean> {
  try {
    const image = sharp(buffer)
    const metadata = await image.metadata()
    
    // Check if image has alpha channel
    if (!metadata.hasAlpha) {
      return false
    }

    // Get raw pixel data to check for actual transparency
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    // Check if any pixel has alpha < 255 (transparent)
    const channels = info.channels
    for (let i = channels - 1; i < data.length; i += channels) {
      if (data[i] < 255) {
        return true // Found transparency
      }
    }

    return false // No transparency found
  } catch (error) {
    console.error('Error validating PNG transparency:', error)
    return false
  }
}

export async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata()
  return {
    width: metadata.width || 0,
    height: metadata.height || 0
  }
}