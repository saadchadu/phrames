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
    icon: '/icons/favicon.png',
    apple: '/icons/favicon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ErrorBoundary>
          <AuthProvider>
            <Navbar />
            {children}
            <Toaster />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}