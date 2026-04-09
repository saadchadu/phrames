'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface UserFiltersProps {
  onFilterChange: (filters: {
    search: string;
    freeCampaignUsed: string;
    blocked: string;
    minCampaigns: string;
    dateFrom: string;
    dateTo: string;
  }) => void;
}

export default function UserFilters({ onFilterChange }: UserFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [freeCampaignUsed, setFreeCampaignUsed] = useState(searchParams.get('freeCampaignUsed') || 'all');
  const [blocked, setBlocked] = useState(searchParams.get('blocked') || 'all');
  const [minCampaigns, setMinCampaigns] = useState(searchParams.get('minCampaigns') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

  useEffect(() => {
    // Update URL params for shareable filtered views
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (freeCampaignUsed !== 'all') params.set('freeCampaignUsed', freeCampaignUsed);
    if (blocked !== 'all') params.set('blocked', blocked);
    if (minCampaigns) params.set('minCampaigns', minCampaigns);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });

    // Notify parent component of filter changes
    onFilterChange({
      search,
      freeCampaignUsed,
      blocked,
      minCampaigns,
      dateFrom,
      dateTo,
    });
  }, [search, freeCampaignUsed, blocked, minCampaigns, dateFrom, dateTo, router, onFilterChange]);

  const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder:text-gray-400";

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 mb-6 space-y-3">
      {/* Row 1: search + dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, username, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>
        <select
          value={freeCampaignUsed}
          onChange={(e) => setFreeCampaignUsed(e.target.value)}
          className={inputClass}
        >
          <option value="all">All Users</option>
          <option value="false">Free Campaign Available</option>
          <option value="true">Free Campaign Used</option>
        </select>
        <select
          value={blocked}
          onChange={(e) => setBlocked(e.target.value)}
          className={inputClass}
        >
          <option value="all">All Status</option>
          <option value="false">Active Only</option>
          <option value="true">Blocked Only</option>
        </select>
      </div>

      {/* Row 2: min campaigns + date range */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="number"
          min="0"
          placeholder="Min campaigns"
          value={minCampaigns}
          onChange={(e) => setMinCampaigns(e.target.value)}
          className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
        />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            title="Joined from"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 text-sm"
          />
          <span className="text-gray-400 text-sm">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            title="Joined to"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 text-sm"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              title="Clear dates"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
