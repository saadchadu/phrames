import { Users, Megaphone, DollarSign, TrendingUp } from 'lucide-react';
import RevenueChart from '@/components/admin/RevenueChart';
import UserGrowthChart from '@/components/admin/UserGrowthChart';
import CampaignTrendsChart from '@/components/admin/CampaignTrendsChart';
import PlanDistributionChart from '@/components/admin/PlanDistributionChart';
import RecentCampaigns from '@/components/admin/RecentCampaigns';
import RecentPayments from '@/components/admin/RecentPayments';
import RecentSignups from '@/components/admin/RecentSignups';
import AdminErrorBoundary from '@/components/admin/AdminErrorBoundary';
import PageHeader from '@/components/admin/PageHeader';

async function getAdminStats() {
  try {
    // Import the stats logic directly to avoid server-side fetch issues
    const { GET } = await import('@/app/api/admin/stats/route');
    const response = await GET();
    const data = await response.json();
    
    // Check if there was an error
    if (data.error) {
      throw new Error(data.message || 'Failed to fetch stats');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    // Return empty data structure instead of null to prevent UI errors
    return {
      stats: {
        totalUsers: 0,
        usersToday: 0,
        totalCampaigns: 0,
        activeCampaigns: 0,
        expiredCampaigns: 0,
        freeCampaignsUsed: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        last30DaysRevenue: 0,
      },
      charts: {
        dailyRevenue: [],
        dailyNewUsers: [],
        planDistribution: {},
      },
      recent: {
        campaigns: [],
        payments: [],
        signups: [],
      },
    };
  }
}

export default async function AdminOverviewPage() {
  const data = await getAdminStats();

  // Handle error state
  if (!data) {
    return (
      <PageHeader 
        title="Admin Dashboard"
        description="Welcome to the Phrames admin dashboard. Monitor and manage your platform."
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg 
                className="h-5 w-5 text-red-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">
                <p>Failed to load dashboard data. Please check your connection and try refreshing the page.</p>
              </div>
            </div>
          </div>
        </div>
      </PageHeader>
    );
  }
  
  const stats = [
    {
      name: 'Total Users',
      value: data?.stats?.totalUsers?.toString() || '0',
      icon: Users,
      change: data?.stats?.usersToday ? `+${data.stats.usersToday} today` : '+0 today',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Campaigns',
      value: data?.stats?.totalCampaigns?.toString() || '0',
      icon: Megaphone,
      change: `${data?.stats?.freeCampaignsUsed || 0} free`,
      changeType: 'positive' as const,
    },
    {
      name: 'Active Campaigns',
      value: data?.stats?.activeCampaigns?.toString() || '0',
      icon: TrendingUp,
      change: `${data?.stats?.expiredCampaigns || 0} expired`,
      changeType: 'positive' as const,
    },
    {
      name: 'Total Revenue',
      value: `₹${data?.stats?.totalRevenue?.toLocaleString('en-IN') || '0'}`,
      icon: DollarSign,
      change: `₹${data?.stats?.last30DaysRevenue?.toLocaleString('en-IN') || '0'} (30d)`,
      changeType: 'positive' as const,
    },
  ];

  return (
    <AdminErrorBoundary>
      <PageHeader 
        title="Admin Dashboard"
        description="Welcome to the Phrames admin dashboard. Monitor and manage your platform."
      >

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="ml-4 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline flex-wrap">
                        <div className="text-xl sm:text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div
                          className={`ml-2 flex items-baseline text-xs sm:text-sm font-semibold ${
                            stat.changeType === 'positive'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {data?.charts?.dailyRevenue && (
          <RevenueChart data={data.charts.dailyRevenue} />
        )}
        {data?.charts?.dailyNewUsers && (
          <UserGrowthChart data={data.charts.dailyNewUsers} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {data?.recent?.campaigns && (
          <CampaignTrendsChart campaigns={data.recent.campaigns} />
        )}
        {data?.charts?.planDistribution && (
          <PlanDistributionChart data={data.charts.planDistribution} />
        )}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <RecentCampaigns campaigns={data?.recent?.campaigns || []} />
        <RecentPayments payments={data?.recent?.payments || []} />
        <RecentSignups signups={data?.recent?.signups || []} />
      </div>
      </PageHeader>
    </AdminErrorBoundary>
  );
}
