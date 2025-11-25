'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UserGrowthChartProps {
  data: Array<{ date: string; users: number }>;
}

export default function UserGrowthChart({ data }: UserGrowthChartProps) {
  // Format date for display (e.g., "Jan 15")
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Daily New Users (Last 30 Days)</h3>
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
            allowDecimals={false}
            tick={{ fontSize: 10 }}
            width={40}
          />
          <Tooltip
            formatter={(value: number) => [value, 'New Users']}
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
            dataKey="users"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 2 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
