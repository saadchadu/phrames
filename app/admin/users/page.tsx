'use client';

import { useState, useEffect, Suspense } from 'react';
import UserFilters from '@/components/admin/UserFilters';
import UserActions from '@/components/admin/UserActions';
import AdminErrorBoundary, { ErrorDisplay } from '@/components/admin/AdminErrorBoundary';
import { TableSkeleton } from '@/components/admin/LoadingState';
import PageHeader from '@/components/admin/PageHeader';
import DataTable, { Column } from '@/components/admin/DataTable';

interface User {
  id: string;
  email: string;
  displayName?: string;
  username?: string;
  totalCampaigns: number;
  freeCampaignUsed?: boolean;
  isAdmin?: boolean;
  isBlocked?: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    freeCampaignUsed: 'all',
    blocked: 'all',
    minCampaigns: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [filters.freeCampaignUsed, filters.blocked, filters.minCampaigns]);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.freeCampaignUsed !== 'all') params.append('freeCampaignUsed', filters.freeCampaignUsed);
      if (filters.blocked !== 'all') params.append('blocked', filters.blocked);
      if (filters.minCampaigns) params.append('minCampaigns', filters.minCampaigns);

      const res = await fetch(`/api/admin/users?${params}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.statusText}`);
      }
      
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(user => {
    // Hide the super admin user from the list
    if (user.email === 'saadchadu@gmail.com') {
      return false;
    }
    
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower)
    );
  });

  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'User',
      sortable: true,
      sortKey: 'displayName',
      render: (user) => {
        const isSuperAdmin = user.email === 'saadchadu@gmail.com';
        return (
          <div className="flex items-center">
            <div>
              <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                {user.displayName || 'User'}
                {user.isAdmin ? (
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                    Admin
                  </span>
                ) : null}
              </div>
              <div className="text-sm text-gray-500">{user.email}</div>
              {user.username && (
                <div className="text-xs text-gray-400">@{user.username}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'campaigns',
      header: 'Campaigns',
      sortable: true,
      sortKey: 'totalCampaigns',
      render: (user) => (
        <div className="text-sm text-gray-900">{user.totalCampaigns}</div>
      ),
    },
    {
      key: 'freeCampaign',
      header: 'Free Campaign',
      sortable: true,
      sortKey: 'freeCampaignUsed',
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.freeCampaignUsed 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {user.freeCampaignUsed ? 'Used' : 'Available'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortKey: 'isBlocked',
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.isBlocked 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {user.isBlocked ? 'Blocked' : 'Active'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <UserActions 
          user={user} 
          onActionComplete={fetchUsers} 
        />
      ),
    },
  ];

  return (
    <AdminErrorBoundary>
      <PageHeader 
        title="User Management"
        description="View and manage all users on the platform"
      >
        {/* Filters */}
        <AdminErrorBoundary>
          <Suspense fallback={<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 mb-6 h-32 animate-pulse" />}>
            <UserFilters onFilterChange={setFilters} />
          </Suspense>
        </AdminErrorBoundary>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay error={error} onRetry={fetchUsers} />
          </div>
        )}

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredUsers}
          keyExtractor={(user) => user.id}
          emptyMessage="No users found"
          isLoading={loading}
          defaultSort={{ key: 'createdAt', direction: 'desc' }}
        />

        <div className="mt-4 text-xs sm:text-sm text-gray-500">
          Showing {filteredUsers.length} user(s)
        </div>
      </PageHeader>
    </AdminErrorBoundary>
  );
}
