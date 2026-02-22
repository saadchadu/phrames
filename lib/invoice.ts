import { getFirestore, Timestamp } from 'firebase-admin/firestore'

export interface InvoiceData {
  invoiceNumber: string
  invoiceDate: Date
  paymentId: string
  orderId: string
  campaignName: string
  planType: string
  planName: string
  validityDays: number
  userName: string
  userEmail: string
  amount: number
  totalAmount: number
  activationDate: Date
  expiryDate: Date | null
  companyDetails: {
    name: string
    email: string
    address: string
    gstin?: string
  }
}

// Generate invoice number in format PHR-XXXXXX using transaction
export async function generateInvoiceNumber(): Promise<string> {
  const db = getFirestore()
  const counterRef = db.collection('settings').doc('invoiceCounter')

  try {
    // Use transaction to ensure atomic increment
    const invoiceNumber = await db.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef)

      let nextNumber = 1
      if (counterDoc.exists) {
        nextNumber = (counterDoc.data()?.lastInvoiceNumber || 0) + 1
      }

      // Update counter
      transaction.set(counterRef, { lastInvoiceNumber: nextNumber }, { merge: true })

      // Format: PHR-000001 (6 digits, zero-padded)
      return `PHR-${String(nextNumber).padStart(6, '0')}`
    })

    return invoiceNumber
  } catch (error) {
    console.error('Error generating invoice number:', error)
    // Fallback to timestamp-based number if transaction fails
    const timestamp = Date.now().toString().slice(-6)
    return `PHR-${timestamp}`
  }
}



// Get plan display name
export function getPlanDisplayName(planType: string): string {
  const planNames: Record<string, string> = {
    week: '1 Week',
    month: '1 Month',
    '3month': '3 Months',
    '6month': '6 Months',
    year: '1 Year'
  }
  return planNames[planType] || planType
}

// Get plan validity days
export function getPlanValidityDays(planType: string): number {
  const planDays: Record<string, number> = {
    week: 7,
    month: 30,
    '3month': 90,
    '6month': 180,
    year: 365
  }
  return planDays[planType] || 30
}

// Company details
export const COMPANY_DETAILS = {
  name: 'Cleffon Design Studio',
  email: 'support@cleffon.com',
  address: 'Cleffon Design Studio, Second Floor, Center Point Building, Kannur, Kerala, India 670002',
}
