'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Campaign {
  id: string;
  createdAt: string;
  expiresAt?: string;
  isActive?: boolean;
  [key: string]: any;
}

interface CampaignTrendsChartProps {
  campaigns: Campaign[];
}

export default function CampaignTrendsChart({ campaigns }: CampaignTrendsChartProps) {
  // Generate data for last 30 days
  const generateChartData = () => {
    const now = new Date();
    const data: Array<{ date: string; active: number; expired: number }> = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      // Count campaigns created on this day
      const dayCampaigns = campaigns.filter(campaign => {
        const createdAt = new Date(campaign.createdAt);
        return createdAt >= dayStart && createdAt < dayEnd;
      });

      // Count active vs expired
      const active = dayCampaigns.filter(c => c.isActive === true).length;
      const expired = dayCampaigns.filter(c => {
        const expiresAt = c.expiresAt ? new Date(c.expiresAt) : null;
        return expiresAt && expiresAt < now;
      }).length;

      data.push({ date: dateStr, active, expired });
    }

    return data;
  };

  const chartData = generateChartData();

  // Format date for display (e.g., "Jan 15")
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Campaign Trends (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height={300} className="min-h-[250px]">
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#6b7280"
            style={{ fontSize: '10px' }}
            interval="preserveStartEnd"
            tick={{ fontSize: 10 }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '10px' }}
            allowDecimals={false}
            tick={{ fontSize: 10 }}
            width={40}
          />
          <Tooltip
            labelFormatter={formatDate}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="active"
            stackId="1"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.6}
            name="Active"
          />
          <Area
            type="monotone"
            dataKey="expired"
            stackId="1"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.6}
            name="Expired"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
