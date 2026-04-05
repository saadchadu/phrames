/**
 * In-memory rate limiter with automatic cleanup.
 *
 * NOTE: This works per-instance. On Vercel serverless each cold start gets a
 * fresh store, which means limits reset between invocations. This is acceptable
 * for low-traffic abuse prevention. For strict distributed limiting, swap in
 * Upstash Redis (@upstash/ratelimit).
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

const stores = new Map<string, Map<string, RateLimitRecord>>()

// Cleanup stale entries every 5 minutes to prevent memory leaks
let cleanupTimer: ReturnType<typeof setInterval> | null = null

function scheduleCleanup() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    Array.from(stores.entries()).forEach(([storeName, store]) => {
      Array.from(store.entries()).forEach(([key, record]) => {
        if (now > record.resetTime) store.delete(key)
      })
      if (store.size === 0) stores.delete(storeName)
    })
  }, 5 * 60 * 1000)

  // Don't block process exit
  if (cleanupTimer.unref) cleanupTimer.unref()
}

function getStore(name: string): Map<string, RateLimitRecord> {
  if (!stores.has(name)) {
    stores.set(name, new Map())
    scheduleCleanup()
  }
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
