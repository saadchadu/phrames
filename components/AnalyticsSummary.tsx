'use client'

interface AnalyticsSummaryProps {
  totalVisits: number
  totalDownloads: number
  conversionRate: number
}

export default function AnalyticsSummary({ 
  totalVisits, 
  totalDownloads, 
  conversionRate 
}: AnalyticsSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      {/* Total Visits */}
      <div className="bg-white border border-[#00240010] rounded-2xl p-6 shadow-sm text-center">
        <p className="text-sm sm:text-base text-primary/60 mb-2 font-medium">Total Visits</p>
        <h3 className="text-3xl sm:text-4xl font-bold text-primary">
          {totalVisits.toLocaleString()}
        </h3>
      </div>

      {/* Total Downloads */}
      <div className="bg-white border border-[#00240010] rounded-2xl p-6 shadow-sm text-center">
        <p className="text-sm sm:text-base text-primary/60 mb-2 font-medium">Total Downloads</p>
        <h3 className="text-3xl sm:text-4xl font-bold text-primary">
          {totalDownloads.toLocaleString()}
        </h3>
      </div>

      {/* Conversion Rate */}
      <div className="bg-white border border-[#00240010] rounded-2xl p-6 shadow-sm text-center">
        <p className="text-sm sm:text-base text-primary/60 mb-2 font-medium">Conversion Rate</p>
        <h3 className="text-3xl sm:text-4xl font-bold text-primary">
          {conversionRate.toFixed(1)}%
        </h3>
      </div>
    </div>
  )
}
