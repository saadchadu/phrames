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
  }) => void;
}

export default function UserFilters({ onFilterChange }: UserFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [freeCampaignUsed, setFreeCampaignUsed] = useState(searchParams.get('freeCampaignUsed') || 'all');
  const [blocked, setBlocked] = useState(searchParams.get('blocked') || 'all');
  const [minCampaigns, setMinCampaigns] = useState(searchParams.get('minCampaigns') || '');

  useEffect(() => {
    // Update URL params for shareable filtered views
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (freeCampaignUsed !== 'all') params.set('freeCampaignUsed', freeCampaignUsed);
    if (blocked !== 'all') params.set('blocked', blocked);
    if (minCampaigns) params.set('minCampaigns', minCampaigns);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });

    // Notify parent component of filter changes
    onFilterChange({
      search,
      freeCampaignUsed,
      blocked,
      minCampaigns,
    });
  }, [search, freeCampaignUsed, blocked, minCampaigns, router, onFilterChange]);

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, username, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Free Campaign Filter */}
        <div>
          <select
            value={freeCampaignUsed}
            onChange={(e) => setFreeCampaignUsed(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Users</option>
            <option value="false">Free Campaign Available</option>
            <option value="true">Free Campaign Used</option>
          </select>
        </div>

        {/* Blocked Status Filter */}
        <div>
          <select
            value={blocked}
            onChange={(e) => setBlocked(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="false">Active Only</option>
            <option value="true">Blocked Only</option>
          </select>
        </div>
      </div>

      {/* Campaign Count Filter */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Campaign Count
        </label>
        <input
          type="number"
          min="0"
          placeholder="Filter by minimum campaigns..."
          value={minCampaigns}
          onChange={(e) => setMinCampaigns(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
