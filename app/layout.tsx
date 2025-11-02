import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import Navbar from '@/components/Navbar'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Phrames - Create Beautiful Frame Campaigns',
  description: 'Create and share beautiful frame campaigns for your events and causes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
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