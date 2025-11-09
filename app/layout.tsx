import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import Navbar from '@/components/Navbar'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Phrames - Create Beautiful Frame Campaigns',
  description: 'Create and share beautiful frame campaigns for your events and causes',
  icons: {
    icon: '/icons/favicon.png',
  },
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