'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import CampaignFilters, { CampaignFilterValues } from '@/components/admin/CampaignFilters';
import CampaignActions from '@/components/admin/CampaignActions';
import AdminErrorBoundary, { ErrorDisplay } from '@/components/admin/AdminErrorBoundary';
import { TableSkeleton } from '@/components/admin/LoadingState';
import PageHeader from '@/components/admin/PageHeader';

interface Campaign {
  id: string;
  campaignName: string;
  slug: string;
  createdBy: string;
  isActive: boolean;
  isFreeCampaign: boolean;
  planType?: string;
  amountPaid?: number;
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
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : campaigns.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-gray-500">No campaigns found</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
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
                        <div>
                          <div className="text-sm font-medium text-gray-900">{campaign.campaignName}</div>
                          <div className="text-sm text-gray-500">{campaign.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        campaign.isFreeCampaign 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {campaign.isFreeCampaign ? 'Free' : campaign.planType || 'Paid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        campaign.isActive && !campaign.isExpired
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.isActive && !campaign.isExpired ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.expiresAt ? new Date(campaign.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <CampaignActions 
                        campaign={campaign} 
                        onActionComplete={handleActionComplete}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs sm:text-sm text-gray-500">
        Showing {campaigns.length} campaign(s)
      </div>
      </PageHeader>
    </AdminErrorBoundary>
  );
}
