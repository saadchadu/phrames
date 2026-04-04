/**
 * CDN URL construction for img.phrames.app.
 *
 * NEVER use Firebase getDownloadURL() for public images.
 * All public images are served via Cloudflare CDN at img.phrames.app.
 *
 * Cloudflare cache rule (configured in CF dashboard):
 *   - Path: /images/*
 *   - Edge TTL: 1 month
 *   - Browser TTL: 1 year
 *   - Cache status: Cache Everything
 *   - Serve stale: enabled
 *   - Strong ETags: enabled
 */

const CDN_BASE = process.env.NEXT_PUBLIC_CDN_BASE || 'https://img.phrames.app'

/**
 * Construct a CDN URL from a Firebase Storage path.
 * e.g. buildCdnUrl("images/abc123.webp") → "https://img.phrames.app/images/abc123.webp"
 */
export function buildCdnUrl(storagePath: string): string {
  // Ensure no double slashes
  const cleanPath = storagePath.startsWith('/') ? storagePath : `/${storagePath}`
  return `${CDN_BASE}${cleanPath}`
}

/**
 * Build a CDN URL directly from a hash + format.
 * e.g. buildCdnUrlFromHash("abc123", "webp") → "https://img.phrames.app/images/abc123.webp"
 */
export function buildCdnUrlFromHash(hash: string, format: 'webp' | 'png'): string {
  return `${CDN_BASE}/images/${hash}.${format}`
}

/**
 * Check if a URL is already a CDN URL (served from img.phrames.app).
 */
export function isCdnUrl(url: string): boolean {
  return url.startsWith(CDN_BASE)
}

/**
 * Check if a URL is a legacy Firebase Storage URL that should be migrated.
 */
export function isFirebaseStorageUrl(url: string): boolean {
  return url.includes('firebasestorage.googleapis.com')
}
