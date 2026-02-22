/**
 * Monitoring and Logging Utilities
 * Provides structured logging for payment events, errors, and performance metrics
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export type EventType =
  | 'payment_initiated'
  | 'payment_success'
  | 'payment_failed'
  | 'payment_cancelled'
  | 'webhook_received'
  | 'webhook_processed'
  | 'webhook_failed'
  | 'campaign_activated'
  | 'campaign_expired'
  | 'expiry_check_started'
  | 'expiry_check_completed'
  | 'api_error'

interface LogContext {
  userId?: string
  campaignId?: string
  orderId?: string
  planType?: string
  amount?: number
  error?: string
  duration?: number
  success?: boolean
  errorRate?: number
  metadata?: Record<string, any>
}

interface PerformanceMetric {
  operation: string
  duration: number
  success: boolean
  timestamp: Date
  context?: Record<string, any>
}

/**
 * Structured logging function
 */
export function logEvent(
  level: LogLevel,
  event: EventType,
  message: string,
  context?: LogContext
) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    event,
    message,
    ...context
  }

  // Skip debug logs in production
  if (process.env.NODE_ENV === 'production' && level === 'debug') {
    return logEntry
  }

  // Format for console output
  const prefix = getLogPrefix(level)
  const contextStr = context ? ` | ${JSON.stringify(context)}` : ''

  switch (level) {
    case 'error':
      console.error(`${prefix} [${event}] ${message}${contextStr}`)
      break
    case 'warn':
      console.warn(`${prefix} [${event}] ${message}${contextStr}`)
      break
    case 'debug':
      console.debug(`${prefix} [${event}] ${message}${contextStr}`)
      break
    default:
      console.log(`${prefix} [${event}] ${message}${contextStr}`)
  }

  // In production, send to external monitoring service if configured
  if (process.env.NODE_ENV === 'production' && level === 'error') {
    // Integration point for error tracking service (e.g., Sentry)
  }

  return logEntry
}

/**
 * Log payment initiation
 */
export function logPaymentInitiated(context: {
  userId: string
  campaignId: string
  planType: string
  amount: number
  orderId: string
}) {
  return logEvent('info', 'payment_initiated', 'Payment initiated', context)
}

/**
 * Log payment success
 */
export function logPaymentSuccess(context: {
  userId: string
  campaignId: string
  orderId: string
  amount: number
  planType: string
}) {
  return logEvent('info', 'payment_success', 'Payment completed successfully', context)
}

/**
 * Log payment failure
 */
export function logPaymentFailed(context: {
  userId?: string
  campaignId?: string
  orderId: string
  error: string
}) {
  return logEvent('error', 'payment_failed', 'Payment failed', context)
}

/**
 * Log webhook received
 */
export function logWebhookReceived(context: {
  type: string
  orderId?: string
}) {
  return logEvent('info', 'webhook_received', `Webhook received: ${context.type}`, context)
}

/**
 * Log webhook processing
 */
export function logWebhookProcessed(context: {
  orderId: string
  campaignId: string
  duration: number
}) {
  return logEvent('info', 'webhook_processed', 'Webhook processed successfully', context)
}

/**
 * Log webhook error
 */
export function logWebhookError(context: {
  orderId?: string
  error: string
  metadata?: Record<string, any>
}) {
  return logEvent('error', 'webhook_failed', 'Webhook processing failed', context)
}

/**
 * Log campaign activation
 */
export function logCampaignActivated(context: {
  campaignId: string
  userId: string
  planType: string
  expiresAt: string
}) {
  return logEvent('info', 'campaign_activated', 'Campaign activated', context)
}

/**
 * Log API error
 */
export function logApiError(context: {
  endpoint: string
  error: string
  userId?: string
  campaignId?: string
  statusCode?: number
  metadata?: Record<string, any>
}) {
  return logEvent('error', 'api_error', `API error at ${context.endpoint}`, context)
}

/**
 * Performance tracking
 */
export class PerformanceTracker {
  private startTime: number
  private operation: string
  private context?: Record<string, any>

  constructor(operation: string, context?: Record<string, any>) {
    this.operation = operation
    this.context = context
    this.startTime = Date.now()
  }

  /**
   * End tracking and log performance
   */
  end(success: boolean = true): PerformanceMetric {
    const duration = Date.now() - this.startTime
    const metric: PerformanceMetric = {
      operation: this.operation,
      duration,
      success,
      timestamp: new Date(),
      context: this.context
    }

    // Log if duration exceeds threshold
    if (duration > 3000) {
      logEvent('warn', 'api_error', `Slow operation: ${this.operation}`, {
        duration,
        ...this.context
      })
    }

    logEvent('debug', 'api_error', `Operation completed: ${this.operation}`, {
      duration,
      success,
      ...this.context
    })

    return metric
  }
}

/**
 * Error rate tracking
 */
class ErrorRateTracker {
  private errors: number = 0
  private requests: number = 0
  private windowStart: number = Date.now()
  private readonly windowSize: number = 60000 // 1 minute

  recordRequest() {
    this.checkWindow()
    this.requests++
  }

  recordError() {
    this.checkWindow()
    this.errors++
  }

  getErrorRate(): number {
    this.checkWindow()
    return this.requests > 0 ? this.errors / this.requests : 0
  }

  private checkWindow() {
    const now = Date.now()
    if (now - this.windowStart > this.windowSize) {
      // Reset window
      this.errors = 0
      this.requests = 0
      this.windowStart = now
    }
  }

  shouldAlert(): boolean {
    const rate = this.getErrorRate()
    return rate > 0.1 && this.requests > 10 // Alert if >10% error rate with >10 requests
  }
}

// Global error rate tracker
const errorRateTracker = new ErrorRateTracker()

/**
 * Track API request
 */
export function trackRequest() {
  errorRateTracker.recordRequest()
}

/**
 * Track API error
 */
export function trackError() {
  errorRateTracker.recordError()

  if (errorRateTracker.shouldAlert()) {
    logEvent('error', 'api_error', 'High error rate detected', {
      errorRate: errorRateTracker.getErrorRate()
    })
  }
}

/**
 * Get current error rate
 */
export function getErrorRate(): number {
  return errorRateTracker.getErrorRate()
}

/**
 * Helper to get log prefix
 */
function getLogPrefix(level: LogLevel): string {
  switch (level) {
    case 'error':
      return '❌ ERROR'
    case 'warn':
      return '⚠️  WARN'
    case 'debug':
      return '🔍 DEBUG'
    default:
      return 'ℹ️  INFO'
  }
}

/**
 * Format error for logging
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`
  }
  return String(error)
}

/**
 * Sanitize error message for client
 */
export function sanitizeErrorForClient(error: unknown): string {
  // Don't expose internal error details to client
  if (process.env.NODE_ENV === 'production') {
    return 'An unexpected error occurred. Please try again.'
  }
  return formatError(error)
}
