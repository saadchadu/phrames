'use client';

import { useState, useEffect, Suspense } from 'react';
import UserFilters from '@/components/admin/UserFilters';
import UserActions from '@/components/admin/UserActions';
import AdminErrorBoundary, { ErrorDisplay } from '@/components/admin/AdminErrorBoundary';
import { TableSkeleton } from '@/components/admin/LoadingState';
import PageHeader from '@/components/admin/PageHeader';

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
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower)
    );
  });

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
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : filteredUsers.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaigns
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Free Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.displayName || 'User'}
                            {user.isAdmin && (
                              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.username && (
                            <div className="text-xs text-gray-400">@{user.username}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.totalCampaigns}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.freeCampaignUsed 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.freeCampaignUsed ? 'Used' : 'Available'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.isBlocked 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <UserActions user={user} onActionComplete={fetchUsers} />
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
        Showing {filteredUsers.length} user(s)
      </div>
      </PageHeader>
    </AdminErrorBoundary>
  );
}
