import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Blog - Photo Frame Campaign Tips & Guides',
  description: 'Learn how to create viral photo frame campaigns, marketing strategies, and best practices for events and brands.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog - Photo Frame Campaign Tips & Guides',
    description: 'Learn how to create viral photo frame campaigns, marketing strategies, and best practices.',
    url: 'https://phrames.cleffon.com/blog',
  },
}

const blogPosts = [
  {
    slug: 'how-to-create-viral-photo-frame-campaigns',
    title: 'How to Create Viral Photo Frame Campaigns in 2024',
    excerpt: 'Learn the proven strategies to create photo frame campaigns that go viral and engage your audience.',
    date: '2024-12-01',
    category: 'Tutorial',
  },
  {
    slug: 'best-twibbon-alternatives',
    title: '10 Best Twibbon Alternatives for Your Next Campaign',
    excerpt: 'Discover the top alternatives to Twibbon for creating engaging photo frame campaigns.',
    date: '2024-11-28',
    category: 'Comparison',
  },
  {
    slug: 'event-marketing-photo-frames',
    title: 'Event Marketing: Using Photo Frames to Boost Engagement',
    excerpt: 'How event organizers can leverage photo frames to increase attendee engagement and social media reach.',
    date: '2024-11-25',
    category: 'Marketing',
  },
]

export default function BlogPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Phrames Blog',
    description: 'Tips, guides, and best practices for photo frame campaigns',
    url: 'https://phrames.cleffon.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Phrames',
      logo: {
        '@type': 'ImageObject',
        url: 'https://phrames.cleffon.com/icons/favicon.png',
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
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                Phrames Blog
              </h1>
              <p className="text-lg text-primary/80 max-w-2xl mx-auto">
                Tips, guides, and strategies for creating successful photo frame campaigns
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-sm text-primary/60">
                        {new Date(post.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-primary mb-3 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-primary/70 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-secondary hover:text-secondary/80 font-semibold"
                    >
                      Read More
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-16 text-center">
              <p className="text-primary/60 mb-6">
                More articles coming soon! Subscribe to stay updated.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-primary px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Get Started with Phrames
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  )
}
