import type { H3Event } from 'h3'
import { getRequestIP, setHeader } from 'h3'

interface RateLimitOptions {
  max: number
  windowMs: number
  blockDurationMs?: number
  message?: string
}

interface RateLimitEntry {
  count: number
  resetAt: number
  blockedUntil: number
}

type Store = Map<string, RateLimitEntry>

declare global {
  // eslint-disable-next-line no-var
  var __phramesRateLimitStore: Store | undefined
}

function getStore(): Store {
  if (!global.__phramesRateLimitStore) {
    global.__phramesRateLimitStore = new Map()
  }
  return global.__phramesRateLimitStore
}

export function enforceRateLimit(event: H3Event, namespace: string, options: RateLimitOptions) {
  const store = getStore()
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const key = `${namespace}:${ip}`
  const now = Date.now()

  const entry = store.get(key) ?? {
    count: 0,
    resetAt: now + options.windowMs,
    blockedUntil: 0
  }

  if (entry.blockedUntil && now < entry.blockedUntil) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000)
    setHeader(event, 'Retry-After', String(retryAfter))
    throw createError({
      statusCode: 429,
      statusMessage: options.message || 'Too many requests. Please try again later.'
    })
  }

  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + options.windowMs
    entry.blockedUntil = 0
  }

  entry.count += 1
  store.set(key, entry)

  const remaining = Math.max(0, options.max - entry.count)
  setHeader(event, 'X-RateLimit-Limit', String(options.max))
  setHeader(event, 'X-RateLimit-Remaining', String(remaining))
  setHeader(event, 'X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)))

  if (entry.count > options.max) {
    entry.blockedUntil = now + (options.blockDurationMs ?? options.windowMs)
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000)
    setHeader(event, 'Retry-After', String(retryAfter))
    throw createError({
      statusCode: 429,
      statusMessage: options.message || 'Too many requests. Please try again later.'
    })
  }
}
