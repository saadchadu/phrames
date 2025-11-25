'use client';

import Link from 'next/link';

interface Payment {
  id: string;
  userId: string;
  campaignId?: string;
  amount: number;
  planType: string;
  status: string;
  createdAt: string;
}

interface RecentPaymentsProps {
  payments: Payment[];
}

export default function RecentPayments({ payments }: RecentPaymentsProps) {
  if (!payments || payments.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Payments</h2>
        <p className="text-sm text-gray-500 text-center py-8">No payments yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Payments</h2>
        <Link 
          href="/admin/payments"
          className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {payments.map((payment) => (
          <div 
            key={payment.id} 
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">
                  ₹{payment.amount.toLocaleString('en-IN')}
                </p>
                <span 
                  className={`px-2 py-1 text-xs rounded-full ${
                    payment.status === 'SUCCESS' || payment.status === 'success'
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {payment.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500 capitalize">
                  {payment.planType}
                </p>
                <span className="text-xs text-gray-400">•</span>
                <p className="text-xs text-gray-500">
                  {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            {payment.campaignId && (
              <Link
                href={`/campaign/${payment.campaignId}`}
                target="_blank"
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View Campaign
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
