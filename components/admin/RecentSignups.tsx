'use client';

import Link from 'next/link';
import { User } from 'lucide-react';

interface UserSignup {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

interface RecentSignupsProps {
  signups: UserSignup[];
}

export default function RecentSignups({ signups }: RecentSignupsProps) {
  if (!signups || signups.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Signups</h2>
        <p className="text-sm text-gray-500 text-center py-8">No signups yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Signups</h2>
        <Link 
          href="/admin/users"
          className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {signups.map((user) => (
          <div 
            key={user.id} 
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
              {new Date(user.createdAt).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
