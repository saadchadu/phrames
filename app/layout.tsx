import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import Navbar from '@/components/Navbar'
import { Toaster } from '@/components/ui/toaster'
import GoogleAnalytics from '@/components/GoogleAnalytics'

export const metadata: Metadata = {
  title: {
    default: 'Phrames - Create Viral Photo Frame Campaigns | Free Trial',
    template: '%s | Phrames'
  },
  description: 'Create custom photo frames for your campaign in minutes. Perfect for events, brands, and causes. Start free for 1 month - no credit card required. Best Twibbon alternative.',
  keywords: [
    'photo frame creator',
    'campaign frame maker',
    'twibbon alternative',
    'custom photo frames',
    'viral campaign tool',
    'social media frames',
    'event photo frames',
    'brand campaign frames',
    'profile picture frames',
    'frame generator online',
    'photo overlay maker',
    'campaign marketing tool',
    'free photo frame app',
    'online frame creator',
    'custom frame design',
    'social media campaign',
    'photo frame app',
    'event marketing tool',
    'brand awareness campaign',
    'digital campaign creator'
  ],
  authors: [{ name: 'Cleffon', url: 'https://cleffon.com' }],
  creator: 'Cleffon',
  publisher: 'Cleffon',
  metadataBase: new URL('https://phrames.cleffon.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },
  openGraph: {
    title: 'Phrames - Create Viral Photo Frame Campaigns | Free Trial',
    description: 'Create custom photo frames for your campaign in minutes. Perfect for events, brands, and causes. Start free for 1 month - no credit card required.',
    url: 'https://phrames.cleffon.com',
    siteName: 'Phrames',
    images: [
      {
        url: '/images/Hero.png',
        width: 1200,
        height: 630,
        alt: 'Phrames - Create Viral Photo Frame Campaigns',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phrames - Create Viral Photo Frame Campaigns | Free Trial',
    description: 'Create custom photo frames for your campaign in minutes. Perfect for events, brands, and causes. Start free for 1 month.',
    images: ['/images/Hero.png'],
    creator: '@cleffon',
    site: '@phrames',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'GHsv_9A2fyvKJclSaSw8FMozx-K6KiiG42rSm74BoRs',
  },
  icons: {
    icon: [
      { url: '/icons/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/icons/favicon.png',
    shortcut: '/icons/favicon.png',
  },
  manifest: '/manifest.json',
  category: 'technology',
  classification: 'Photo Frame Campaign Creator',
  applicationName: 'Phrames',
  appleWebApp: {
    capable: true,
    title: 'Phrames',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Phrames" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="HandheldFriendly" content="true" />
        <link rel="apple-touch-icon" href="/icons/favicon.png" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        {/* Cashfree Payment Gateway SDK v3 */}
        <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning={true}>
        <GoogleAnalytics />
        <ErrorBoundary>
          <AuthProvider>
            <Navbar />
            <main>
              {children}
            </main>
            <Toaster />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}