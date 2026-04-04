/**
 * Web Worker: Off-thread image compression.
 *
 * Receives: { imageData: ArrayBuffer, width: number, height: number,
 *             targetWidth: number, targetHeight: number,
 *             quality: number, format: 'webp' | 'png', hasTransparency: boolean }
 *
 * Responds: { blob: Blob, format: 'webp' | 'png' }
 *
 * NOTE: OffscreenCanvas is used when available (Chrome/Edge).
 * Safari fallback is handled in the main thread (lib/image-compression.ts).
 */

self.onmessage = async function (e) {
  const { imageData, width, height, targetWidth, targetHeight, quality, format, hasTransparency } = e.data

  try {
    // OffscreenCanvas is available in Chrome/Edge workers
    if (typeof OffscreenCanvas === 'undefined') {
      // Signal main thread to handle compression (Safari fallback)
      self.postMessage({ fallback: true })
      return
    }

    const canvas = new OffscreenCanvas(targetWidth, targetHeight)
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      self.postMessage({ error: 'Could not get OffscreenCanvas context' })
      return
    }

    // Reconstruct ImageData from the transferred buffer
    const imgData = new ImageData(new Uint8ClampedArray(imageData), width, height)

    // Draw scaled image using a temporary full-size canvas then scale
    const srcCanvas = new OffscreenCanvas(width, height)
    const srcCtx = srcCanvas.getContext('2d')
    if (!srcCtx) {
      self.postMessage({ error: 'Could not get source canvas context' })
      return
    }
    srcCtx.putImageData(imgData, 0, 0)

    // Scale to target dimensions
    ctx.drawImage(srcCanvas, 0, 0, width, height, 0, 0, targetWidth, targetHeight)

    // Choose format: WebP unless transparency requires PNG
    const outputFormat = hasTransparency && format === 'png' ? 'image/png' : 'image/webp'
    const outputQuality = outputFormat === 'image/png' ? undefined : quality

    const blob = await canvas.convertToBlob({ type: outputFormat, quality: outputQuality })

    self.postMessage({ blob, format: outputFormat === 'image/png' ? 'png' : 'webp' })
  } catch (err) {
    self.postMessage({ error: err instanceof Error ? err.message : 'Compression failed' })
  }
}
