// Cashfree SDK loaded via CDN
interface CashfreeCheckoutOptions {
  paymentSessionId: string
  returnUrl?: string
  notifyUrl?: string
  redirectTarget?: '_self' | '_blank' | '_parent' | '_top'
}

interface CashfreeSDK {
  checkout(options: CashfreeCheckoutOptions): void
}

interface Window {
  Cashfree?: CashfreeSDK
}
