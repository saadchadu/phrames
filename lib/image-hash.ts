/**
 * Client-side SHA-256 hashing for image deduplication.
 * Hash is used as the filename to prevent duplicate uploads.
 */

/**
 * Generate a SHA-256 hex hash of a File's raw bytes.
 */
export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Build the canonical CDN path for an image given its hash and format.
 * e.g. "images/abc123.webp"
 */
export function buildImagePath(hash: string, format: 'webp' | 'png'): string {
  return `images/${hash}.${format}`
}
