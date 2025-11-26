'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function PaymentSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    
    const queryString = params.toString();
    router.push(`/admin/payments${queryString ? `?${queryString}` : ''}`);
  }, [searchQuery, router, searchParams]);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          id="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Payment ID, User ID, Campaign ID, or Order ID..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          aria-label="Search transactions by ID"
        />
      </div>
      {searchQuery && (
        <p className="mt-2 text-xs text-gray-500">
          Searching for: <span className="font-medium text-gray-700">{searchQuery}</span>
          <button
            onClick={() => setSearchQuery('')}
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            Clear
          </button>
        </p>
      )}
    </div>
  );
}
