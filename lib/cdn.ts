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
 * Convert a legacy Firebase Storage URL to a CDN URL.
 *
 * Firebase Storage URLs look like:
 *   https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encoded-path}?alt=media&token=...
 *
 * We extract the path, decode it, and construct the CDN URL.
 * The Cloudflare cache rule on img.phrames.app matches all image extensions
 * regardless of path, so all Firebase Storage paths are routed through CDN.
 * If the URL is already a CDN URL or can't be parsed, it's returned as-is.
 */
export function normalizeToCdnUrl(url: string): string {
  if (!url) return url
  // Already a CDN URL
  if (isCdnUrl(url)) return url

  try {
    const parsed = new URL(url)
    if (parsed.hostname !== 'firebasestorage.googleapis.com') return url

    // Path format: /v0/b/{bucket}/o/{encoded-object-path}
    const match = parsed.pathname.match(/^\/v0\/b\/[^/]+\/o\/(.+)$/)
    if (!match) return url

    const storagePath = decodeURIComponent(match[1])
    return buildCdnUrl(storagePath)
  } catch {
    return url
  }
}

/**
 * Check if a URL is a legacy Firebase Storage URL.
 */
export function isFirebaseStorageUrl(url: string): boolean {
  return url.includes('firebasestorage.googleapis.com')
}
