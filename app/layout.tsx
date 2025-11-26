import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import Navbar from '@/components/Navbar'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Phrames - Create Viral Photo Frame Campaigns | Free Trial',
  description: 'Create custom photo frames for your campaign in minutes. Perfect for events, brands, and causes. Start free for 1 month - no credit card required.',
  keywords: ['photo frame', 'campaign creator', 'frame generator', 'twibbon alternative', 'online frame app', 'Phrames', 'viral campaign', 'social media frames', 'custom profile frames', 'event frames'],
  authors: [{ name: 'Cleffon' }],
  creator: 'Cleffon',
  publisher: 'Cleffon',
  metadataBase: new URL('https://phrames.cleffon.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Phrames - Create Viral Photo Frame Campaigns | Free Trial',
    description: 'Create custom photo frames for your campaign in minutes. Perfect for events, brands, and causes. Start free for 1 month.',
    url: 'https://phrames.cleffon.com',
    siteName: 'Phrames',
    images: [
      {
        url: '/og-image.png',
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
    description: 'Create custom photo frames for your campaign in minutes. Perfect for events, brands, and causes.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Phrames" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="HandheldFriendly" content="true" />
        <link rel="apple-touch-icon" href="/icons/favicon.png" />
        {/* Cashfree Payment Gateway SDK v3 */}
        <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
      </head>
      <body className="font-sans antialiased">
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