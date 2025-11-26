import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Phrames',
  description: 'Privacy policy for Phrames platform - How we collect, use, and protect your data',
}

export default function PrivacyPolicyPage() {
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

        <h1 className="text-4xl font-bold text-primary mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-primary/70 mb-6">
            <strong>Last Updated:</strong> November 26, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">1. Introduction</h2>
            <p className="text-primary/80 mb-4">
              Welcome to Phrames. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, store, and protect your information when you use our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">2. Information We Collect</h2>
            <p className="text-primary/80 mb-4">
              We collect the following types of information:
            </p>
            <ul className="list-disc pl-6 text-primary/80 space-y-2 mb-4">
              <li><strong>Account Information:</strong> Name, email address, and authentication details when you create an account</li>
              <li><strong>Campaign Content:</strong> Frame images and campaign details you upload</li>
              <li><strong>Payment Information:</strong> Processed securely through Cashfree (we do not store credit card details)</li>
              <li><strong>Usage Data:</strong> Campaign views, downloads, and interaction statistics</li>
              <li><strong>Device Information:</strong> IP address, browser type, and device information</li>
            </ul>
            <div className="bg-secondary/10 border-l-4 border-secondary p-4 mt-4">
              <p className="text-primary/90 font-semibold mb-2">Important: Supporter Images</p>
              <p className="text-primary/80">
                We do NOT store supporter images. When supporters upload their photos to create framed images, the processing happens in their browser. Only the frame images uploaded by campaign creators are stored on our servers. Supporter photos are never uploaded or saved to our platform.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">3. How We Use Your Information</h2>
            <p className="text-primary/80 mb-4">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 text-primary/80 space-y-2 mb-4">
              <li>Provide and maintain the Phrames service</li>
              <li>Process your campaign creations and manage your account</li>
              <li>Handle payments and billing</li>
              <li>Send important service updates and notifications</li>
              <li>Improve our platform and user experience</li>
              <li>Prevent fraud and ensure platform security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">4. Data Storage and Security</h2>
            <p className="text-primary/80 mb-4">
              We take data security seriously:
            </p>
            <ul className="list-disc pl-6 text-primary/80 space-y-2 mb-4">
              <li>Your data is stored securely using Firebase and Google Cloud Platform</li>
              <li>We use industry-standard encryption for data transmission</li>
              <li>Payment processing is handled by Cashfree with PCI DSS compliance</li>
              <li>Access to personal data is restricted to authorized personnel only</li>
              <li>We regularly review and update our security measures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-primary/80 mb-4">
              We do not sell your personal information. We may share your data only in these circumstances:
            </p>
            <ul className="list-disc pl-6 text-primary/80 space-y-2 mb-4">
              <li><strong>Service Providers:</strong> With trusted third parties who help us operate our platform (Firebase, Cashfree)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Public Campaigns:</strong> Campaign content marked as public will be visible to other users</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">6. Your Rights and Choices</h2>
            <p className="text-primary/80 mb-4">
              You have the following rights regarding your data:
            </p>
            <ul className="list-disc pl-6 text-primary/80 space-y-2 mb-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct your information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your campaign data</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="text-primary/80 mb-4">
              To exercise these rights, contact us at{' '}
              <a href="mailto:support@cleffon.com" className="text-secondary hover:underline">
                support@cleffon.com
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">7. Cookies and Tracking</h2>
            <p className="text-primary/80 mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 text-primary/80 space-y-2 mb-4">
              <li>Keep you logged in to your account</li>
              <li>Remember your preferences</li>
              <li>Analyze platform usage and performance</li>
              <li>Improve user experience</li>
            </ul>
            <p className="text-primary/80 mb-4">
              You can control cookies through your browser settings, but some features may not work properly if cookies are disabled.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">8. Children's Privacy</h2>
            <p className="text-primary/80 mb-4">
              Phrames is not intended for users under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">9. Data Retention</h2>
            <p className="text-primary/80 mb-4">
              We retain your personal data for as long as:
            </p>
            <ul className="list-disc pl-6 text-primary/80 space-y-2 mb-4">
              <li>Your account is active</li>
              <li>Needed to provide our services</li>
              <li>Required by law or for legitimate business purposes</li>
            </ul>
            <p className="text-primary/80 mb-4">
              When you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required to retain it by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">10. International Data Transfers</h2>
            <p className="text-primary/80 mb-4">
              Your data may be transferred to and processed in countries other than India. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">11. Changes to This Policy</h2>
            <p className="text-primary/80 mb-4">
              We may update this privacy policy from time to time. We will notify you of significant changes by email or through a notice on our platform. Your continued use of Phrames after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">12. Contact Us</h2>
            <p className="text-primary/80 mb-4">
              If you have questions about this privacy policy or how we handle your data, please contact us:
            </p>
            <ul className="list-none text-primary/80 space-y-2 mb-4">
              <li><strong>Support:</strong> <a href="mailto:support@cleffon.com" className="text-secondary hover:underline">support@cleffon.com</a></li>
              <li><strong>Business Inquiries:</strong> <a href="mailto:hello@cleffon.com" className="text-secondary hover:underline">hello@cleffon.com</a></li>
              <li><strong>Website:</strong> <a href="https://cleffon.com" className="text-secondary hover:underline">cleffon.com</a></li>
            </ul>
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
