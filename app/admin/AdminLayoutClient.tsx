'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  CreditCard,
  FileText,
  Settings,
  Menu,
  X,
  MessageSquare,
} from 'lucide-react';

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (loading) return;
      
      if (!user) {
        // Not logged in - redirect to login
        router.push('/login?redirect=/admin&error=auth_required');
        return;
      }

      try {
        // Get the ID token result which includes custom claims
        const idTokenResult = await user.getIdTokenResult();
        const isAdminUser = idTokenResult.claims.isAdmin === true;
        
        if (!isAdminUser) {
          // Not admin - redirect to home
          router.push('/?error=unauthorized');
          return;
        }
        
        setIsAdmin(true);
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/?error=auth_error');
      }
    };

    checkAdminStatus();
  }, [user, loading, router]);

  // Show loading state while checking
  if (isChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Don't render admin layout if not admin
  if (!isAdmin) {
    return null;
  }

  const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/admin/campaigns', icon: Megaphone },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Tickets', href: '/admin/support', icon: MessageSquare },
    { name: 'Logs', href: '/admin/logs', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50" data-admin-layout>
      {/* Mobile menu button - floating */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-20 left-4 z-30 p-2 rounded-md bg-white shadow-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar - Fixed */}
      <aside className="hidden lg:fixed lg:top-16 lg:bottom-0 lg:left-0 lg:z-20 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 h-full">
          {/* Desktop navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
}
