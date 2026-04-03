/**
 * Simple in-memory rate limiter.
 * For multi-instance deployments, replace with Redis/Upstash.
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

const stores = new Map<string, Map<string, RateLimitRecord>>()

function getStore(name: string): Map<string, RateLimitRecord> {
  if (!stores.has(name)) stores.set(name, new Map())
  return stores.get(name)!
}

export interface RateLimitOptions {
  /** Unique name for this limiter (e.g. 'password-reset') */
  name: string
  /** Max requests per window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 */
export function checkRateLimit(key: string, options: RateLimitOptions): boolean {
  const store = getStore(options.name)
  const now = Date.now()
  const record = store.get(key)

  if (!record || now > record.resetTime) {
    store.set(key, { count: 1, resetTime: now + options.windowMs })
    return true
  }

  if (record.count >= options.limit) return false

  record.count++
  return true
}
