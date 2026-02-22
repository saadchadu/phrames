'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PlanDistributionChartProps {
  data: {
    week: number;
    month: number;
    '3month': number;
    '6month': number;
    year: number;
  };
}

export default function PlanDistributionChart({ data }: PlanDistributionChartProps) {
  // Transform data for chart
  const chartData = [
    { name: 'Week', value: data.week, label: '1 Week' },
    { name: 'Month', value: data.month, label: '1 Month' },
    { name: '3 Months', value: data['3month'], label: '3 Months' },
    { name: '6 Months', value: data['6month'], label: '6 Months' },
    { name: 'Year', value: data.year, label: '1 Year' },
  ];

  // Colors for each bar
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Plan Distribution</h3>
      <ResponsiveContainer width="100%" height={300} className="min-h-[250px]">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            stroke="#6b7280"
            style={{ fontSize: '10px' }}
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '10px' }}
            allowDecimals={false}
            tick={{ fontSize: 10 }}
            width={40}
          />
          <Tooltip
            formatter={(value: number | undefined) => [value ?? 0, 'Plans Sold']}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
