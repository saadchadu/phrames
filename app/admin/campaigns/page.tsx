'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import CampaignFilters, { CampaignFilterValues } from '@/components/admin/CampaignFilters';
import CampaignActions from '@/components/admin/CampaignActions';
import AdminErrorBoundary, { ErrorDisplay } from '@/components/admin/AdminErrorBoundary';
import { TableSkeleton } from '@/components/admin/LoadingState';
import PageHeader from '@/components/admin/PageHeader';
import DataTable, { Column } from '@/components/admin/DataTable';

interface Campaign {
  id: string;
  campaignName: string;
  slug: string;
  createdBy: string;
  isActive: boolean;
  isFreeCampaign: boolean;
  planType?: string;
  amountPaid?: number;
  paymentId?: string;
  createdAt: string;
  expiresAt?: string;
  isExpired?: boolean;
  imageUrl?: string;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<CampaignFilterValues>({
    search: '',
    status: '',
    paymentType: '',
    userId: '',
    dateFrom: '',
    dateTo: '',
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      
      // Add all filter parameters
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.status) params.append('status', currentFilters.status);
      if (currentFilters.paymentType) params.append('paymentType', currentFilters.paymentType);
      if (currentFilters.userId) params.append('userId', currentFilters.userId);
      if (currentFilters.dateFrom) params.append('dateFrom', currentFilters.dateFrom);
      if (currentFilters.dateTo) params.append('dateTo', currentFilters.dateTo);

      const res = await fetch(`/api/admin/campaigns?${params}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch campaigns: ${res.statusText}`);
      }
      
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError(error instanceof Error ? error.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [currentFilters.search, currentFilters.status, currentFilters.paymentType, currentFilters.userId, currentFilters.dateFrom, currentFilters.dateTo]);

  const handleFilterChange = useCallback((filters: CampaignFilterValues) => {
    setCurrentFilters(filters);
  }, []);

  function handleActionComplete() {
    fetchCampaigns();
  }

  const columns: Column<Campaign>[] = [
    {
      key: 'campaign',
      header: 'Campaign',
      sortable: true,
      sortKey: 'campaignName',
      render: (campaign) => (
        <div className="flex items-center gap-3">
          {campaign.imageUrl && (
            <img 
              src={campaign.imageUrl} 
              alt={campaign.campaignName}
              className="w-12 h-12 rounded object-cover flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="text-sm font-medium text-gray-900">{campaign.campaignName}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      sortKey: 'isFreeCampaign',
      render: (campaign) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          campaign.isFreeCampaign 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {campaign.isFreeCampaign ? 'Free' : campaign.planType || 'Paid'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortKey: 'isActive',
      render: (campaign) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          campaign.isExpired 
            ? 'bg-red-100 text-red-800'
            : campaign.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
        }`}>
          {campaign.isExpired ? 'Expired' : campaign.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'campaignId',
      header: 'Campaign ID',
      sortable: true,
      sortKey: 'id',
      render: (campaign) => (
        <div className="text-sm text-gray-900 font-mono">{campaign.id}</div>
      ),
    },
    {
      key: 'expires',
      header: 'Expires',
      sortable: true,
      sortKey: 'expiresAt',
      render: (campaign) => (
        <div className="text-sm text-gray-900">
          {campaign.expiresAt 
            ? new Date(campaign.expiresAt).toLocaleDateString()
            : 'Never'
          }
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (campaign) => (
        <CampaignActions 
          campaign={campaign} 
          onActionComplete={handleActionComplete} 
        />
      ),
    },
  ];

  return (
    <AdminErrorBoundary>
      <PageHeader 
        title="Campaign Management"
        description="View and manage all campaigns on the platform"
      >
        {/* Campaign Filters Component */}
        <AdminErrorBoundary>
          <Suspense fallback={<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 mb-6 h-32 animate-pulse" />}>
            <CampaignFilters onFilterChange={handleFilterChange} />
          </Suspense>
        </AdminErrorBoundary>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay error={error} onRetry={fetchCampaigns} />
          </div>
        )}

        {/* Table */}
        <DataTable
          columns={columns}
          data={campaigns}
          keyExtractor={(campaign) => campaign.id}
          emptyMessage="No campaigns found"
          isLoading={loading}
          defaultSort={{ key: 'createdAt', direction: 'desc' }}
        />

        <div className="mt-4 text-xs sm:text-sm text-gray-500">
          Showing {campaigns.length} campaign(s)
        </div>
      </PageHeader>
    </AdminErrorBoundary>
  );
}
