import type { Metadata } from 'next'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Contact Us - Phrames Support',
  description: 'Get in touch with Phrames support team. We are here to help with your photo frame campaigns.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us - Phrames Support',
    description: 'Get in touch with Phrames support team.',
    url: 'https://phrames.cleffon.com/contact',
  },
}

export default function ContactPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Phrames',
    description: 'Get in touch with Phrames support team',
    url: 'https://phrames.cleffon.com/contact',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-white">
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 text-center">
              Contact Us
            </h1>
            <p className="text-lg text-primary/80 mb-12 text-center">
              Have questions? We are here to help!
            </p>

            <div className="bg-gray-50 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Get Support</h2>
              <p className="text-primary/80 mb-6">
                For support inquiries, feature requests, or general questions, please reach out to us:
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-primary mb-2">Email Support</h3>
                  <a 
                    href="mailto:support@cleffon.com" 
                    className="text-secondary hover:underline"
                  >
                    support@cleffon.com
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-2">Response Time</h3>
                  <p className="text-primary/80">We typically respond within 24 hours</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Quick Links</h2>
              <ul className="space-y-3">
                <li>
                  <a href="/support" className="text-secondary hover:underline">
                    Support Center
                  </a>
                </li>
                <li>
                  <a href="/#faq" className="text-secondary hover:underline">
                    Frequently Asked Questions
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-secondary hover:underline">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" className="text-secondary hover:underline">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  )
}
