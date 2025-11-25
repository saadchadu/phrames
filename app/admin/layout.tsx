import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AdminLayoutClient from './AdminLayoutClient';
import { verifyAdminAccess } from '@/lib/admin-auth';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // For now, allow access to admin routes
  // The client-side will check admin status via Firebase custom claims
  // TODO: Implement proper server-side session management
  
  // In production, you should:
  // 1. Create a session cookie when users log in
  // 2. Verify the session cookie here
  // 3. Redirect non-admin users
  
  // Temporary: Allow access, client-side will handle admin checks
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
