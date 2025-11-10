'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'

interface DailyStats {
  date: string
  visits: number
  downloads: number
}

interface AnalyticsChartProps {
  data: DailyStats[]
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  // Format date for display (MM/DD)
  const formattedData = data.map(stat => ({
    ...stat,
    displayDate: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }))

  return (
    <div className="bg-white border border-[#00240010] rounded-2xl p-6 sm:p-8 shadow-sm">
      <h2 className="text-lg sm:text-xl font-semibold text-primary mb-6">
        Daily Campaign Performance
      </h2>
      
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-[#f2fff2] rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary/60 mb-2">No data yet</h3>
          <p className="text-primary/50 text-sm max-w-md">
            Analytics data will appear here once your campaigns start receiving visits and downloads.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00240010" />
            <XAxis 
              dataKey="displayDate" 
              stroke="#00240066"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#00240066' }}
            />
            <YAxis 
              stroke="#00240066"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#00240066' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #00240020',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
              labelStyle={{ color: '#002400', fontWeight: 600, marginBottom: '4px' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="visits" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={{ fill: '#8884d8', r: 3 }}
              activeDot={{ r: 5 }}
              name="Visits"
            />
            <Line 
              type="monotone" 
              dataKey="downloads" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 3 }}
              activeDot={{ r: 5 }}
              name="Downloads"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
