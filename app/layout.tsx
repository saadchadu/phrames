import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import Navbar from '@/components/Navbar'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Phrames — Create Custom Photo Frames & Campaigns Online',
  description: 'Create and share beautiful photo frame campaigns instantly. Phrames lets you upload PNG frames, share campaign links, and let users personalize their photos online for free.',
  keywords: ['photo frame', 'campaign creator', 'frame generator', 'twibbon alternative', 'online frame app', 'Phrames'],
  authors: [{ name: 'Cleffon' }],
  creator: 'Cleffon',
  publisher: 'Cleffon',
  metadataBase: new URL('https://phrames.cleffon.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Phrames — Create and Share Photo Frame Campaigns',
    description: 'Make your own photo frame campaigns. Free, fast, and watermark-free.',
    url: 'https://phrames.cleffon.com',
    siteName: 'Phrames',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Phrames - Create Beautiful Photo Frames',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phrames — Create and Share Photo Frame Campaigns',
    description: 'Create and share free online photo frames instantly.',
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#00dd78" />
      </head>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Toaster />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}