'use client';

interface LoadingStateProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingState({ text = 'Loading...', size = 'md' }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-2',
    lg: 'h-14 w-14 border-3'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-emerald-600 ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-4 text-gray-600 text-center text-sm">{text}</p>
      )}
    </div>
  );
}

// Skeleton loader for data tables
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Skeleton loader for stats cards
export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

// Skeleton loader for charts
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
      <div 
        className="bg-gray-100 rounded animate-pulse" 
        style={{ height: `${height}px` }}
      ></div>
    </div>
  );
}
