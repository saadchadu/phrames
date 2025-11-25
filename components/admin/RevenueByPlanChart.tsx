'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RevenueByPlanChartProps {
  data: {
    [key: string]: number;
  };
}

export default function RevenueByPlanChart({ data }: RevenueByPlanChartProps) {
  // Transform data for pie chart
  const chartData = Object.entries(data).map(([plan, revenue]) => ({
    name: formatPlanName(plan),
    value: revenue,
  })).filter(item => item.value > 0); // Only show plans with revenue

  // Colors for each plan type
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Format plan name for display
  function formatPlanName(plan: string): string {
    const planNames: { [key: string]: string } = {
      'week': '1 Week',
      'month': '1 Month',
      '3month': '3 Months',
      '6month': '6 Months',
      'year': '1 Year',
    };
    return planNames[plan] || plan;
  }

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  // Custom label for pie slices
  const renderLabel = (entry: { value: number }) => {
    const percent = ((entry.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
    return `${percent}%`;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No revenue data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300} className="min-h-[250px]">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '12px',
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ fontSize: '12px' }}
          formatter={(value) => <span className="text-xs sm:text-sm text-gray-700">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
