import crypto from 'crypto'

/**
 * Verify Cashfree webhook signature
 * @param payload - Raw webhook payload as string
 * @param signature - Signature from x-webhook-signature header
 * @param timestamp - Timestamp from x-webhook-timestamp header
 * @returns boolean indicating if signature is valid
 */
export function verifyCashfreeSignature(
  payload: string,
  signature: string,
  timestamp: string
): boolean {
  try {
    const secret = process.env.CASHFREE_CLIENT_SECRET
    if (!secret) {
      return false
    }

    // Reject webhooks older than 5 minutes to prevent replay attacks
    const webhookTime = parseInt(timestamp, 10)
    const now = Math.floor(Date.now() / 1000)
    if (isNaN(webhookTime) || Math.abs(now - webhookTime) > 300) {
      return false
    }

    // Cashfree signature format: timestamp + payload
    const signatureData = `${timestamp}${payload}`
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signatureData)
      .digest('base64')

    // Use timing-safe comparison to prevent timing attacks
    const expectedBuf = Buffer.from(expectedSignature)
    const receivedBuf = Buffer.from(signature)
    if (expectedBuf.length !== receivedBuf.length) {
      return false
    }
    return crypto.timingSafeEqual(expectedBuf, receivedBuf)
  } catch (error) {
    return false
  }
}
