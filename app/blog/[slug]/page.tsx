import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/Footer'

type BlogPost = {
  slug: string
  title: string
  description: string
  content: string
  date: string
  author: string
  category: string
  keywords: string[]
}

const blogPosts: Record<string, BlogPost> = {
  'how-to-create-viral-photo-frame-campaigns': {
    slug: 'how-to-create-viral-photo-frame-campaigns',
    title: 'How to Create Viral Photo Frame Campaigns in 2024',
    description: 'Learn the proven strategies to create photo frame campaigns that go viral and engage your audience. Step-by-step guide with examples.',
    date: '2024-12-01',
    author: 'Phrames Team',
    category: 'Tutorial',
    keywords: ['viral campaigns', 'photo frame campaigns', 'social media marketing', 'campaign strategy'],
    content: `
      <h2>What Makes a Photo Frame Campaign Go Viral?</h2>
      <p>Creating a viral photo frame campaign requires understanding your audience, crafting compelling visuals, and making sharing effortless. Here's how to do it right.</p>
      
      <h3>1. Design an Eye-Catching Frame</h3>
      <p>Your frame should be visually appealing and align with your brand or event theme. Use bold colors, clear messaging, and ensure it looks good on profile pictures.</p>
      
      <h3>2. Make It Easy to Share</h3>
      <p>The easier it is for people to use your frame, the more likely they are to share it. Phrames makes this simple with one-click frame application and instant downloads.</p>
      
      <h3>3. Leverage Social Proof</h3>
      <p>Show how many people have already used your frame. This creates FOMO (fear of missing out) and encourages more participation.</p>
      
      <h3>4. Time It Right</h3>
      <p>Launch your campaign when your audience is most active. For events, start 2-3 weeks before to build momentum.</p>
      
      <h3>5. Incentivize Sharing</h3>
      <p>Consider running contests or giveaways for people who share their framed photos. This dramatically increases engagement.</p>
      
      <h2>Best Practices</h2>
      <ul>
        <li>Keep your frame design simple and recognizable</li>
        <li>Use high-quality images (1080x1080px minimum)</li>
        <li>Include your brand logo or event name</li>
        <li>Test on different photo types before launching</li>
        <li>Track metrics to understand what works</li>
      </ul>
      
      <h2>Get Started Today</h2>
      <p>Ready to create your viral campaign? Sign up for Phrames and launch your first campaign in minutes.</p>
    `,
  },
  'best-twibbon-alternatives': {
    slug: 'best-twibbon-alternatives',
    title: '10 Best Twibbon Alternatives for Your Next Campaign',
    description: 'Discover the top alternatives to Twibbon for creating engaging photo frame campaigns. Compare features, pricing, and ease of use.',
    date: '2024-11-28',
    author: 'Phrames Team',
    category: 'Comparison',
    keywords: ['twibbon alternative', 'photo frame tools', 'campaign tools', 'social media tools'],
    content: `
      <h2>Why Look for Twibbon Alternatives?</h2>
      <p>While Twibbon is popular, many users seek alternatives that offer better features, pricing, or user experience. Here are the top options.</p>
      
      <h3>1. Phrames - Best Overall</h3>
      <p>Phrames offers the most intuitive interface with powerful features. Free trial for 1 month, no credit card required.</p>
      <ul>
        <li>Easy campaign creation</li>
        <li>Real-time analytics</li>
        <li>No watermarks</li>
        <li>QR code generation</li>
        <li>Affordable pricing</li>
      </ul>
      
      <h3>2. Canva - Best for Design Flexibility</h3>
      <p>Great for creating custom frames but requires more design work. Not specialized for campaigns.</p>
      
      <h3>3. PicMonkey - Best for Photo Editing</h3>
      <p>Powerful photo editor but lacks campaign-specific features like tracking and sharing.</p>
      
      <h2>Feature Comparison</h2>
      <p>When choosing a tool, consider:</p>
      <ul>
        <li>Ease of use</li>
        <li>Campaign tracking</li>
        <li>Pricing</li>
        <li>Customization options</li>
        <li>Mobile compatibility</li>
        <li>Support quality</li>
      </ul>
      
      <h2>Why Phrames Stands Out</h2>
      <p>Phrames is built specifically for campaign creators. Unlike general design tools, it includes everything you need to launch, track, and optimize your campaigns.</p>
    `,
  },
  'event-marketing-photo-frames': {
    slug: 'event-marketing-photo-frames',
    title: 'Event Marketing: Using Photo Frames to Boost Engagement',
    description: 'How event organizers can leverage photo frames to increase attendee engagement and social media reach. Proven strategies and case studies.',
    date: '2024-11-25',
    author: 'Phrames Team',
    category: 'Marketing',
    keywords: ['event marketing', 'photo frames', 'event engagement', 'social media marketing'],
    content: `
      <h2>The Power of Photo Frames for Events</h2>
      <p>Photo frames are one of the most effective tools for event marketing. They turn attendees into brand ambassadors and create lasting social media buzz.</p>
      
      <h3>Why Photo Frames Work for Events</h3>
      <ul>
        <li>Creates visual unity across social media</li>
        <li>Increases event visibility</li>
        <li>Encourages attendee participation</li>
        <li>Provides measurable engagement metrics</li>
        <li>Extends event reach beyond attendees</li>
      </ul>
      
      <h3>Best Practices for Event Frames</h3>
      <ol>
        <li><strong>Launch Early:</strong> Start your campaign 2-3 weeks before the event</li>
        <li><strong>Make It Exclusive:</strong> Create special frames for VIP attendees or early birds</li>
        <li><strong>Use QR Codes:</strong> Place QR codes at the venue for easy access</li>
        <li><strong>Incentivize Sharing:</strong> Run contests for best framed photos</li>
        <li><strong>Track Metrics:</strong> Monitor usage to measure campaign success</li>
      </ol>
      
      <h3>Case Study: Conference Success</h3>
      <p>A tech conference used Phrames to create custom frames for their 2024 event. Results:</p>
      <ul>
        <li>5,000+ frame applications</li>
        <li>2.3M social media impressions</li>
        <li>40% increase in event hashtag usage</li>
        <li>Extended reach to 50+ countries</li>
      </ul>
      
      <h2>Getting Started</h2>
      <p>Ready to boost your event engagement? Create your first event frame campaign with Phrames today.</p>
    `,
  },
}

export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts[slug]
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://phrames.cleffon.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = blogPosts[slug]

  if (!post) {
    notFound()
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Phrames',
      logo: {
        '@type': 'ImageObject',
        url: 'https://phrames.cleffon.com/icons/favicon.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://phrames.cleffon.com/blog/${post.slug}`,
    },
    keywords: post.keywords.join(', '),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-white">
        <article className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Link
                href="/blog"
                className="inline-flex items-center text-secondary hover:text-secondary/80 font-semibold mb-6"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Blog
              </Link>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                  {post.category}
                </span>
                <span className="text-sm text-primary/60">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                {post.title}
              </h1>
              
              <p className="text-lg text-primary/70">
                By {post.author}
              </p>
            </div>

            <div 
              className="prose prose-lg max-w-none prose-headings:text-primary prose-p:text-primary/80 prose-a:text-secondary prose-strong:text-primary prose-ul:text-primary/80 prose-ol:text-primary/80"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="bg-secondary/10 rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold text-primary mb-4">
                  Ready to Create Your Campaign?
                </h3>
                <p className="text-primary/80 mb-6">
                  Start your free trial today and launch your first viral photo frame campaign.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-primary px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </article>
        <Footer />
      </main>
    </>
  )
}
