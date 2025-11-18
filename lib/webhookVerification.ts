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
      console.error('CASHFREE_CLIENT_SECRET not configured')
      return false
    }

    // Cashfree signature format: timestamp + payload
    const signatureData = `${timestamp}${payload}`
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signatureData)
      .digest('base64')
    
    return expectedSignature === signature
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}
