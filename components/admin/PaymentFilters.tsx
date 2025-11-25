'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PaymentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [timeRange, setTimeRange] = useState(searchParams.get('timeRange') || '');
  const [planType, setPlanType] = useState(searchParams.get('planType') || '');

  useEffect(() => {
    const params = new URLSearchParams();
    
    if (status) params.set('status', status);
    if (timeRange) params.set('timeRange', timeRange);
    if (planType) params.set('planType', planType);
    
    const queryString = params.toString();
    router.push(`/admin/payments${queryString ? `?${queryString}` : ''}`);
  }, [status, timeRange, planType, router]);

  const handleReset = () => {
    setStatus('');
    setTimeRange('');
    setPlanType('');
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Range
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Time</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan Type
          </label>
          <select
            value={planType}
            onChange={(e) => setPlanType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
