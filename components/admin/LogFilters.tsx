'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LogEventType } from '@/lib/admin-logging';

export default function LogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentEventType = searchParams.get('eventType') || '';
  const currentDateRange = searchParams.get('dateRange') || '';

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`/admin/logs?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/admin/logs');
  };

  const hasActiveFilters = currentEventType || currentDateRange;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Event Type Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Type
          </label>
          <select
            value={currentEventType}
            onChange={(e) => handleFilterChange('eventType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">All Events</option>
            <option value={LogEventType.ADMIN_ACTION}>Admin Action</option>
            <option value={LogEventType.CRON_EXECUTION}>Cron Execution</option>
            <option value={LogEventType.WEBHOOK_FAILURE}>Webhook Failure</option>
            <option value={LogEventType.CAMPAIGN_EXPIRY}>Campaign Expiry</option>
            <option value={LogEventType.CAMPAIGN_DEACTIVATED}>Campaign Deactivated</option>
            <option value={LogEventType.CAMPAIGN_REACTIVATED}>Campaign Reactivated</option>
            <option value={LogEventType.CAMPAIGN_EXTENDED}>Campaign Extended</option>
            <option value={LogEventType.CAMPAIGN_DELETED}>Campaign Deleted</option>
            <option value={LogEventType.USER_BLOCKED}>User Blocked</option>
            <option value={LogEventType.USER_UNBLOCKED}>User Unblocked</option>
            <option value={LogEventType.USER_DELETED}>User Deleted</option>
            <option value={LogEventType.USER_ADMIN_SET}>User Admin Set</option>
            <option value={LogEventType.USER_FREE_CAMPAIGN_RESET}>User Free Campaign Reset</option>
            <option value={LogEventType.SETTINGS_CHANGED}>Settings Changed</option>
            <option value={LogEventType.PAYMENT_SUCCESS}>Payment Success</option>
            <option value={LogEventType.PAYMENT_FAILURE}>Payment Failure</option>
            <option value={LogEventType.MANUAL_CRON_TRIGGER}>Manual Cron Trigger</option>
            <option value={LogEventType.DATA_EXPORT}>Data Export</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            value={currentDateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {currentEventType && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Event: {currentEventType}
              <button
                onClick={() => handleFilterChange('eventType', '')}
                className="ml-2 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
          {currentDateRange && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Date: {currentDateRange}
              <button
                onClick={() => handleFilterChange('dateRange', '')}
                className="ml-2 hover:text-green-900"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Get color coding for event types
 */
export function getEventTypeColor(eventType: string): string {
  const colorMap: Record<string, string> = {
    [LogEventType.ADMIN_ACTION]: 'bg-blue-100 text-blue-800',
    [LogEventType.CRON_EXECUTION]: 'bg-purple-100 text-purple-800',
    [LogEventType.WEBHOOK_FAILURE]: 'bg-red-100 text-red-800',
    [LogEventType.CAMPAIGN_EXPIRY]: 'bg-orange-100 text-orange-800',
    [LogEventType.CAMPAIGN_DEACTIVATED]: 'bg-yellow-100 text-yellow-800',
    [LogEventType.CAMPAIGN_REACTIVATED]: 'bg-green-100 text-green-800',
    [LogEventType.CAMPAIGN_EXTENDED]: 'bg-teal-100 text-teal-800',
    [LogEventType.CAMPAIGN_DELETED]: 'bg-red-100 text-red-800',
    [LogEventType.USER_BLOCKED]: 'bg-red-100 text-red-800',
    [LogEventType.USER_UNBLOCKED]: 'bg-green-100 text-green-800',
    [LogEventType.USER_DELETED]: 'bg-red-100 text-red-800',
    [LogEventType.USER_ADMIN_SET]: 'bg-indigo-100 text-indigo-800',
    [LogEventType.USER_FREE_CAMPAIGN_RESET]: 'bg-cyan-100 text-cyan-800',
    [LogEventType.SETTINGS_CHANGED]: 'bg-purple-100 text-purple-800',
    [LogEventType.PAYMENT_SUCCESS]: 'bg-green-100 text-green-800',
    [LogEventType.PAYMENT_FAILURE]: 'bg-red-100 text-red-800',
    [LogEventType.MANUAL_CRON_TRIGGER]: 'bg-indigo-100 text-indigo-800',
    [LogEventType.DATA_EXPORT]: 'bg-blue-100 text-blue-800',
  };

  return colorMap[eventType] || 'bg-gray-100 text-gray-800';
}
