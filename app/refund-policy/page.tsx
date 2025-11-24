import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy | Phrames',
  description: 'Refund and cancellation policy for Phrames platform',
}

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-primary hover:text-secondary mb-8 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-primary mb-8">Refund Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-primary/70 mb-6">
            <strong>Last Updated:</strong> November 24, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">1. General Policy</h2>
            <p className="text-primary/80 mb-4">
              At Phrames, we are committed to providing quality service to all our users. This refund policy outlines the circumstances under which refunds may be issued.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">2. No Refund Policy</h2>
            <p className="text-primary/80 mb-4">
              <strong>All payments made for campaign plans are non-refundable once the service has been provided.</strong>
            </p>
            <p className="text-primary/80 mb-4">
              This means that once your campaign is activated and made visible on our platform, no refunds will be issued for:
            </p>
            <ul className="list-disc pl-6 text-primary/80 space-y-2 mb-4">
              <li>Change of mind after purchase</li>
              <li>Unused portion of a plan period</li>
              <li>Early termination of a campaign by the user</li>
              <li>Dissatisfaction with campaign performance or reach</li>
              <li>Technical issues on the user's end (device, browser, internet connection)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">3. Refund Eligibility</h2>
            <p className="text-primary/80 mb-4">
              Refunds will <strong>ONLY</strong> be issued in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-primary/80 space-y-2 mb-4">
              <li>
                <strong>Service Not Provided:</strong> If we fail to activate your campaign within 24 hours of successful payment
              </li>
              <li>
                <strong>Technical Failure:</strong> If our platform experiences a complete service outage for more than 72 consecutive hours
              </li>
              <li>
                <strong>Duplicate Payment:</strong> If you were accidentally charged multiple times for the same transaction
              </li>
              <li>
                <strong>Payment Error:</strong> If you were charged but the payment was not processed correctly on our end
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">4. Refund Process</h2>
            <p className="text-primary/80 mb-4">
              If you believe you are eligible for a refund based on the criteria above:
            </p>
            <ol className="list-decimal pl-6 text-primary/80 space-y-2 mb-4">
              <li>Contact us immediately through our website at <a href="https://cleffon.com" className="text-secondary hover:underline">cleffon.com</a></li>
              <li>Provide your transaction ID, campaign details, and reason for refund request</li>
              <li>Our team will review your request within 3-5 business days</li>
              <li>If approved, refunds will be processed within 7-10 business days</li>
              <li>Refunds will be issued to the original payment method used</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">5. Free Campaign Policy</h2>
            <p className="text-primary/80 mb-4">
              The first free campaign (1 month) provided to new users is a promotional offer and does not involve any payment. Therefore, no refund applies to free campaigns.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">6. Campaign Expiration</h2>
            <p className="text-primary/80 mb-4">
              All campaigns have a defined duration based on the selected plan:
            </p>
            <ul className="list-disc pl-6 text-primary/80 space-y-2 mb-4">
              <li>1 Week Plan: 7 days</li>
              <li>1 Month Plan: 30 days</li>
              <li>3 Months Plan: 90 days</li>
              <li>1 Year Plan: 365 days</li>
            </ul>
            <p className="text-primary/80 mb-4">
              Campaigns automatically expire after the plan duration. No refunds will be issued for expired campaigns or unused time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">7. Service Modifications</h2>
            <p className="text-primary/80 mb-4">
              We reserve the right to modify our service features, pricing, or plans at any time. However, changes will not affect active campaigns that have already been paid for.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">8. Account Termination</h2>
            <p className="text-primary/80 mb-4">
              If your account is terminated due to violation of our Terms and Conditions, no refunds will be issued for any active campaigns or unused plan time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">9. Payment Disputes</h2>
            <p className="text-primary/80 mb-4">
              If you have a dispute regarding a payment, please contact us directly before initiating a chargeback with your bank or payment provider. Chargebacks may result in account suspension.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">10. Contact for Refund Requests</h2>
            <p className="text-primary/80 mb-4">
              For any refund-related queries or requests, please contact us at:
            </p>
            <p className="text-primary/80 mb-4">
              Website: <a href="https://cleffon.com" className="text-secondary hover:underline">cleffon.com</a>
            </p>
            <p className="text-primary/80 mb-4">
              Please include your transaction details, campaign information, and a clear explanation of why you believe you are eligible for a refund.
            </p>
          </section>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mt-8">
            <p className="text-yellow-800 font-semibold mb-2">Important Notice</p>
            <p className="text-yellow-700">
              By making a payment on Phrames, you acknowledge that you have read, understood, and agree to this refund policy. All sales are final once the service has been provided.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Image
              src="/logos/Logo-black.svg"
              alt="Phrames Logo"
              width={103}
              height={25}
              className="h-6 w-auto"
            />
            <p className="text-primary/70 text-sm sm:text-base font-medium text-center sm:text-right">
              copyright reserved to <a href="http://cleffon.com" className="text-secondary hover:underline">Cleffon</a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
