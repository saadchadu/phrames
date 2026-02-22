'use client';

import { Search, X, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface CampaignFilterValues {
  search: string;
  status: string;
  paymentType: string;
  visibility: string;
  supporters: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
}

interface CampaignFiltersProps {
  onFilterChange: (filters: CampaignFilterValues) => void;
}

export default function CampaignFilters({ onFilterChange }: CampaignFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL params
  const [filters, setFilters] = useState<CampaignFilterValues>({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    paymentType: searchParams.get('paymentType') || '',
    visibility: searchParams.get('visibility') || '',
    supporters: searchParams.get('supporters') || '',
    userId: searchParams.get('userId') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
  });

  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        updateFilter('search', localSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch]);

  // Update URL params and notify parent when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    // Update URL without page reload
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });

    // Notify parent component
    onFilterChange(filters);
  }, [filters, onFilterChange, router]);

  const updateFilter = (key: keyof CampaignFilterValues, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilter = (key: keyof CampaignFilterValues) => {
    if (key === 'search') {
      setLocalSearch('');
    }
    updateFilter(key, '');
  };

  const clearAllFilters = () => {
    setLocalSearch('');
    setFilters({
      search: '',
      status: '',
      paymentType: '',
      visibility: '',
      supporters: '',
      userId: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Main Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Search Input */}
        <div className="lg:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by name, campaign ID, or user ID..."
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                clearFilter('search');
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Payment Type Filter */}
        <div>
          <select
            value={filters.paymentType}
            onChange={(e) => updateFilter('paymentType', e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
          >
            <option value="">All Types</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {/* Visibility Filter */}
        <div>
          <select
            value={filters.visibility}
            onChange={(e) => updateFilter('visibility', e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
          >
            <option value="">All Visibility</option>
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {/* User ID Filter */}
        <div className="relative">
          <input
            type="text"
            value={filters.userId}
            onChange={(e) => updateFilter('userId', e.target.value)}
            placeholder="Filter by User ID..."
            className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
          />
          {filters.userId && (
            <button
              onClick={() => clearFilter('userId')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Supporters Filter */}
        <div>
          <select
            value={filters.supporters}
            onChange={(e) => updateFilter('supporters', e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
          >
            <option value="">All Supporters</option>
            <option value="0">0 supporters</option>
            <option value="1-10">1 – 10</option>
            <option value="11-50">11 – 50</option>
            <option value="51-100">51 – 100</option>
            <option value="100+">100+</option>
          </select>
        </div>

        {/* Date From Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
            placeholder="From Date"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
          />
        </div>

        {/* Date To Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
            placeholder="To Date"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Active Filters:</span>

            {filters.search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Search: {filters.search}
                <button onClick={() => clearFilter('search')} className="hover:text-emerald-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.status && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Status: {filters.status}
                <button onClick={() => clearFilter('status')} className="hover:text-emerald-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.paymentType && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Type: {filters.paymentType}
                <button onClick={() => clearFilter('paymentType')} className="hover:text-emerald-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.visibility && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Visibility: {filters.visibility}
                <button onClick={() => clearFilter('visibility')} className="hover:text-purple-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.userId && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                User: {filters.userId}
                <button onClick={() => clearFilter('userId')} className="hover:text-emerald-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.supporters && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Supporters: {filters.supporters === '0' ? '0' : filters.supporters === '100+' ? '100+' : filters.supporters}
                <button onClick={() => clearFilter('supporters')} className="hover:text-emerald-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.dateFrom && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                From: {new Date(filters.dateFrom).toLocaleDateString()}
                <button onClick={() => clearFilter('dateFrom')} className="hover:text-emerald-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.dateTo && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                To: {new Date(filters.dateTo).toLocaleDateString()}
                <button onClick={() => clearFilter('dateTo')} className="hover:text-emerald-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-600 hover:text-gray-900 underline ml-2"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
