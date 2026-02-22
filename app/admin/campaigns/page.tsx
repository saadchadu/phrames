'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { LayoutGrid, List, Globe, Lock, Users, Calendar } from 'lucide-react';
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
  createdByEmail?: string;
  isActive: boolean;
  isFreeCampaign: boolean;
  planType?: string;
  amountPaid?: number;
  paymentId?: string;
  visibility?: string;
  createdAt: string;
  expiresAt?: string;
  isExpired?: boolean;
  imageUrl?: string;
  frameURL?: string;
  hasPendingPayment?: boolean;
  supportersCount?: number;
}

type ViewMode = 'table' | 'grid';

// ── Visibility badge ──────────────────────────────────────────────────────────
function VisibilityBadge({ visibility }: { visibility?: string }) {
  const isPublic = (visibility || '').toLowerCase() === 'public';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isPublic
        ? 'bg-blue-100 text-blue-700'
        : 'bg-purple-100 text-purple-700'
        }`}
    >
      {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
      {isPublic ? 'Public' : 'Unlisted'}
    </span>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ campaign }: { campaign: Campaign }) {
  if (campaign.isExpired)
    return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>;
  if (campaign.hasPendingPayment)
    return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Awaiting Payment</span>;
  if (campaign.isActive)
    return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
  return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>;
}

// ── Grid Card ─────────────────────────────────────────────────────────────────
function CampaignCard({ campaign, onActionComplete }: { campaign: Campaign; onActionComplete: () => void }) {
  const imageUrl = campaign.frameURL || campaign.imageUrl;
  const isActive = campaign.isActive && !campaign.isExpired;

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col transition-shadow duration-200 ${campaign.isExpired
        ? 'opacity-50 grayscale border-gray-200'
        : 'border-gray-200 hover:shadow-md'
      }`}>
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={campaign.campaignName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        {/* Fallback */}
        <div className={`${imageUrl ? 'hidden' : ''} w-full h-full flex items-center justify-center text-gray-400`}>
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        {/* Expired overlay ribbon */}
        {campaign.isExpired && (
          <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
            <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Expired
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">{campaign.campaignName}</h3>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${campaign.isFreeCampaign ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
            {campaign.isFreeCampaign ? 'Free' : campaign.planType || 'Paid'}
          </span>
          <StatusBadge campaign={campaign} />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {campaign.supportersCount ?? 0}
          </span>
          {campaign.expiresAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(campaign.expiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
            </span>
          )}
        </div>


        <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
          <CampaignActions campaign={campaign} onActionComplete={onActionComplete} />
          <VisibilityBadge visibility={campaign.visibility} />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentFilters, setCurrentFilters] = useState<CampaignFilterValues>({
    search: '',
    status: '',
    paymentType: '',
    visibility: '',
    userId: '',
    dateFrom: '',
    dateTo: '',
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();

      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.status) params.append('status', currentFilters.status);
      if (currentFilters.paymentType) params.append('paymentType', currentFilters.paymentType);
      if (currentFilters.visibility) params.append('visibility', currentFilters.visibility);
      if (currentFilters.userId) params.append('userId', currentFilters.userId);
      if (currentFilters.dateFrom) params.append('dateFrom', currentFilters.dateFrom);
      if (currentFilters.dateTo) params.append('dateTo', currentFilters.dateTo);

      const res = await fetch(`/api/admin/campaigns?${params}`);
      if (!res.ok) throw new Error(`Failed to fetch campaigns: ${res.statusText}`);
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [
    currentFilters.search, currentFilters.status, currentFilters.paymentType,
    currentFilters.visibility, currentFilters.userId, currentFilters.dateFrom, currentFilters.dateTo,
  ]);

  const handleFilterChange = useCallback((filters: CampaignFilterValues) => {
    setCurrentFilters(filters);
  }, []);

  function handleActionComplete() { fetchCampaigns(); }

  // ── Table columns (original) ─────────────────────────────────────────────
  const columns: Column<Campaign>[] = [
    {
      key: 'campaign',
      header: 'Campaign',
      sortable: true,
      sortKey: 'campaignName',
      render: (campaign) => (
        <div className="text-sm font-medium text-gray-900">{campaign.campaignName}</div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      sortKey: 'isFreeCampaign',
      render: (campaign) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign.isFreeCampaign ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
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
      render: (campaign) => <StatusBadge campaign={campaign} />,
    },
    {
      key: 'campaignId',
      header: 'Campaign ID',
      sortable: true,
      sortKey: 'id',
      render: (campaign) => <div className="text-sm text-gray-900 font-mono">{campaign.id}</div>,
    },
    {
      key: 'expires',
      header: 'Expires',
      sortable: true,
      sortKey: 'expiresAt',
      render: (campaign) => (
        <div className="text-sm text-gray-900">
          {campaign.expiresAt ? new Date(campaign.expiresAt).toLocaleDateString() : 'Never'}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (campaign) => (
        <CampaignActions campaign={campaign} onActionComplete={handleActionComplete} />
      ),
    },

  ];

  return (
    <AdminErrorBoundary>
      <PageHeader
        title="Campaign Management"
        description="View and manage all campaigns on the platform"
      >
        {/* Filters + View Toggle */}
        <div className="relative">
          <AdminErrorBoundary>
            <Suspense fallback={<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 mb-6 h-32 animate-pulse" />}>
              <CampaignFilters onFilterChange={handleFilterChange} />
            </Suspense>
          </AdminErrorBoundary>

          {/* View mode toggle — sits top-right of the filter card area */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm mb-4 w-fit ml-auto -mt-2">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'table'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <List className="h-4 w-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'grid'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Gallery
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay error={error} onRetry={fetchCampaigns} />
          </div>
        )}

        {/* ── TABLE VIEW ── */}
        {viewMode === 'table' && (
          <DataTable
            columns={columns}
            data={campaigns}
            keyExtractor={(campaign) => campaign.id}
            emptyMessage="No campaigns found"
            isLoading={loading}
            defaultSort={{ key: 'createdAt', direction: 'desc' }}
          />
        )}

        {/* ── GRID/GALLERY VIEW ── */}
        {viewMode === 'grid' && (
          <>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-100" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-16 text-gray-500">No campaigns found</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...campaigns]
                  .sort((a, b) => (a.isExpired ? 1 : 0) - (b.isExpired ? 1 : 0))
                  .map((campaign) => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      onActionComplete={handleActionComplete}
                    />
                  ))}
              </div>
            )}
          </>
        )}

        <div className="mt-4 text-xs sm:text-sm text-gray-500">
          Showing {campaigns.length} campaign(s)
        </div>
      </PageHeader>
    </AdminErrorBoundary>
  );
}
