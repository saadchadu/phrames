'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueTrendChartProps {
  data: Array<{ date: string; revenue: number }>;
}

export default function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  // Format date for display (e.g., "Jan 15")
  const formatDate = (dateStr: any): string => {
    if (typeof dateStr !== 'string') return String(dateStr);
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No revenue trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300} className="min-h-[250px]">
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
          tickFormatter={(value) => `₹${value}`}
          tick={{ fontSize: 10 }}
          width={50}
        />
        <Tooltip
          formatter={(value: number | undefined) => [formatCurrency(value ?? 0), 'Revenue']}
          labelFormatter={formatDate}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '12px',
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 2 }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
