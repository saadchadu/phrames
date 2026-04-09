import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import Navbar from '@/components/Navbar'
import { Toaster } from '@/components/ui/toaster'
import GoogleAnalytics from '@/components/GoogleAnalytics'

export const metadata: Metadata = {
  title: {
    default: 'Phrames - Free Twibbon Alternative | Create Photo Frame Campaigns',
    template: '%s | Phrames'
  },
  description: 'Phrames is the best free Twibbonize alternative. Create custom photo frame campaigns, profile picture overlays, and twibbon frames in minutes. No watermarks. Free for 1 month.',
  keywords: [
    // Direct competitor keywords
    'twibbonize alternative',
    'twibbon alternative',
    'free twibbon maker',
    'twibbonize free',
    'twibbon creator',
    'create twibbon',
    'twibbon campaign',
    'twibbon frame maker',
    // Core product keywords
    'photo frame campaign',
    'profile picture frame maker',
    'profile photo frame creator',
    'photo overlay maker',
    'profile picture overlay',
    'campaign frame generator',
    'photo frame generator online',
    'custom photo frame online',
    // Use case keywords
    'election campaign frame',
    'event photo frame',
    'fundraising campaign frame',
    'awareness campaign frame',
    'social media campaign frame',
    'profile picture campaign',
    // Long tail
    'create photo frame for campaign',
    'add frame to profile picture',
    'viral photo frame campaign',
    'free profile picture frame',
    'online photo frame creator no watermark',
    'photo frame campaign creator free',
    'twibbon maker free no watermark',
    'best twibbon alternative free',
  ],
  authors: [{ name: 'Cleffon', url: 'https://cleffon.com' }],
  creator: 'Cleffon',
  publisher: 'Cleffon',
  metadataBase: new URL('https://phrames.app'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },
  openGraph: {
    title: 'Phrames - Free Twibbon Alternative | Create Photo Frame Campaigns',
    description: 'The best free Twibbonize alternative. Create custom photo frame campaigns and profile picture overlays in minutes. No watermarks. Free for 1 month.',
    url: 'https://phrames.app',
    siteName: 'Phrames',
    images: [
      {
        url: '/images/featured-image-phrames.png',
        width: 1200,
        height: 630,
        alt: 'Phrames - Free Twibbon Alternative to Create Photo Frame Campaigns',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phrames - Free Twibbon Alternative | Create Photo Frame Campaigns',
    description: 'The best free Twibbonize alternative. Create custom photo frame campaigns and profile picture overlays in minutes. No watermarks.',
    images: ['/images/featured-image-phrames.png'],
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
    google: 'Gyf1UMeTKr2NLBJNiggaKVIXRcR_QvBfVU2xFueTww0',
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://sdk.cashfree.com" />
        <link rel="dns-prefetch" href="https://sdk.cashfree.com" />
        {/* Cashfree Payment Gateway SDK v3 */}
        <script src="https://sdk.cashfree.com/js/v3/cashfree.js" defer></script>
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