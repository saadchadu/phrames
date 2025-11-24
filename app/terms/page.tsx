import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms and Conditions | Phrames',
  description: 'Terms and conditions for using Phrames platform',
}

export default function TermsPage() {
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

        <h1 className="text-4xl font-bold text-primary mb-8">Terms and Conditions</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-primary/70 mb-6">
            <strong>Last Updated:</strong> November 24, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">1. Acceptance of Terms</h2>
            <p className="text-primary/80 mb-4">
              By accessing and using Phrames ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">2. Service Description</h2>
            <p className="text-primary/80 mb-4">
              Phrames is a platform that allows users to create and share custom photo frame campaigns. Users can upload PNG frames with transparency and share them with others who can then create personalized images.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">3. User Accounts</h2>
            <p className="text-primary/80 mb-4">
              To use certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-primary/80 space-y-2 mb-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your password and account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Be responsible for all activities that occur under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">4. Campaign Plans and Pricing</h2>
            <p className="text-primary/80 mb-4">
              Phrames offers the following campaign plans:
            </p>
            <ul className="list-disc pl-6 text-primary/80 space-y-2 mb-4">
              <li><strong>First Campaign Free:</strong> New users receive their first campaign free for 1 month</li>
              <li><strong>Paid Plans:</strong> Additional campaigns or extended durations require payment as per our pricing page</li>
              <li><strong>Campaign Duration:</strong> Campaigns remain active and visible for the duration of the selected plan</li>
              <li><strong>Expiration:</strong> Campaigns automatically become inactive after the plan expires unless renewed</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">5. Payment Terms</h2>
            <p className="text-primary/80 mb-4">
              All payments are processed securely through Cashfree. By making a payment, you agree to:
            </p>
            <ul className="list-disc pl-6 text-primary/80 space-y-2 mb-4">
              <li>Provide valid payment information</li>
              <li>Pay all fees associated with your selected plan</li>
              <li>Authorize us to charge your payment method for the selected services</li>
              <li>Accept that all prices are in Indian Rupees (INR)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">6. Content Guidelines</h2>
            <p className="text-primary/80 mb-4">
              You are responsible for all content you upload to Phrames. You agree not to upload content that:
            </p>
            <ul className="list-disc pl-6 text-primary/80 space-y-2 mb-4">
              <li>Violates any laws or regulations</li>
              <li>Infringes on intellectual property rights of others</li>
              <li>Contains hate speech, violence, or discriminatory content</li>
              <li>Contains explicit, pornographic, or inappropriate material</li>
              <li>Promotes illegal activities or harmful behavior</li>
              <li>Contains malware, viruses, or malicious code</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">7. Intellectual Property</h2>
            <p className="text-primary/80 mb-4">
              You retain all rights to the content you upload. By uploading content to Phrames, you grant us a non-exclusive, worldwide license to host, store, and display your content as necessary to provide the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">8. Service Availability</h2>
            <p className="text-primary/80 mb-4">
              We strive to provide reliable service but do not guarantee uninterrupted access. We reserve the right to:
            </p>
            <ul className="list-disc pl-6 text-primary/80 space-y-2 mb-4">
              <li>Modify or discontinue the Service with or without notice</li>
              <li>Perform maintenance that may temporarily affect availability</li>
              <li>Suspend or terminate accounts that violate these terms</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">9. Limitation of Liability</h2>
            <p className="text-primary/80 mb-4">
              To the maximum extent permitted by law, Phrames and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">10. Termination</h2>
            <p className="text-primary/80 mb-4">
              We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason at our discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">11. Changes to Terms</h2>
            <p className="text-primary/80 mb-4">
              We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">12. Contact Information</h2>
            <p className="text-primary/80 mb-4">
              For questions about these terms, please contact us through our website at{' '}
              <a href="https://cleffon.com" className="text-secondary hover:underline">
                cleffon.com
              </a>
            </p>
          </section>
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
