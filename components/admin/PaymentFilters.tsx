'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';

export default function PaymentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [timeRange, setTimeRange] = useState(searchParams.get('timeRange') || '');
  const [planType, setPlanType] = useState(searchParams.get('planType') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      
      if (status) params.set('status', status);
      if (timeRange) params.set('timeRange', timeRange);
      if (planType) params.set('planType', planType);
      if (searchQuery) params.set('search', searchQuery);
      
      const queryString = params.toString();
      const currentQuery = searchParams.toString();
      
      // Only update if the URL actually changed
      if (queryString !== currentQuery) {
        router.replace(`/admin/payments${queryString ? `?${queryString}` : ''}`, { scroll: false });
      }
    }, searchQuery !== searchParams.get('search') ? 500 : 0);
    
    return () => clearTimeout(timer);
  }, [status, timeRange, planType, searchQuery, router, searchParams]);

  const handleReset = () => {
    setStatus('');
    setTimeRange('');
    setPlanType('');
    setSearchQuery('');
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Payment ID, User ID, Campaign ID, or Order ID..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          aria-label="Search transactions by ID"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            aria-label="Filter by payment status"
            id="status-filter"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        <div>
          <label htmlFor="timerange-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Time Range
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            aria-label="Filter by time range"
            id="timerange-filter"
          >
            <option value="">All Time</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        <div>
          <label htmlFor="plantype-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Plan Type
          </label>
          <select
            value={planType}
            onChange={(e) => setPlanType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            aria-label="Filter by plan type"
            id="plantype-filter"
          >
            <option value="">All Plans</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="3month">3 Months</option>
            <option value="6month">6 Months</option>
            <option value="year">Year</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}
