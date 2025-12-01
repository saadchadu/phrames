import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'About Phrames - Photo Frame Campaign Platform',
  description: 'Learn about Phrames, the leading platform for creating viral photo frame campaigns. Perfect for events, brands, and causes.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Phrames - Photo Frame Campaign Platform',
    description: 'Learn about Phrames, the leading platform for creating viral photo frame campaigns.',
    url: 'https://phrames.cleffon.com/about',
  },
}

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Phrames',
    description: 'Learn about Phrames, the leading platform for creating viral photo frame campaigns.',
    url: 'https://phrames.cleffon.com/about',
    mainEntity: {
      '@type': 'Organization',
      name: 'Phrames',
      url: 'https://phrames.cleffon.com',
      logo: 'https://phrames.cleffon.com/icons/favicon.png',
      description: 'Create and share custom photo frame campaigns online',
      foundingDate: '2024',
      founder: {
        '@type': 'Organization',
        name: 'Cleffon',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-white">
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              About Phrames
            </h1>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-primary/80 mb-6">
                Phrames is the leading platform for creating and sharing viral photo frame campaigns. 
                We make it easy for brands, events, and causes to create engaging visual campaigns 
                that spread organically through social media.
              </p>
              
              <h2 className="text-3xl font-bold text-primary mt-12 mb-4">Our Mission</h2>
              <p className="text-lg text-primary/80 mb-6">
                To empower everyone to create viral visual campaigns that amplify their message 
                and engage their community through shareable photo frames.
              </p>

              <h2 className="text-3xl font-bold text-primary mt-12 mb-4">Why Choose Phrames?</h2>
              <ul className="list-disc pl-6 text-lg text-primary/80 space-y-3 mb-6">
                <li>Easy to use - create campaigns in minutes</li>
                <li>No design skills required</li>
                <li>Free trial for 1 month</li>
                <li>Track campaign performance in real-time</li>
                <li>High-quality downloads with no watermarks</li>
                <li>Perfect for events, brands, and causes</li>
              </ul>

              <h2 className="text-3xl font-bold text-primary mt-12 mb-4">Get Started Today</h2>
              <p className="text-lg text-primary/80 mb-6">
                Join thousands of creators who trust Phrames for their photo frame campaigns.
              </p>
              
              <div className="mt-8">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-primary px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  )
}
