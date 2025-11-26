'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DollarSign, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import PaymentFilters from '@/components/admin/PaymentFilters';
import PaymentSearch from '@/components/admin/PaymentSearch';
import RevenueByPlanChart from '@/components/admin/RevenueByPlanChart';
import RevenueTrendChart from '@/components/admin/RevenueTrendChart';
import AdminErrorBoundary, { ErrorDisplay } from '@/components/admin/AdminErrorBoundary';
import { TableSkeleton, StatsCardSkeleton, ChartSkeleton } from '@/components/admin/LoadingState';
import PageHeader from '@/components/admin/PageHeader';
import RefundModal from '@/components/admin/RefundModal';
import { toast } from '@/components/ui/toaster';

function PaymentsContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<{ id: string; amount: number } | null>(null);
  const [refundingPayment, setRefundingPayment] = useState(false);
  const searchParams = useSearchParams();

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  async function fetchPayments() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams(searchParams.toString());
      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch payments: ${res.statusText}`);
      }
      
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }

  const openRefundModal = (paymentId: string, amount: number) => {
    setSelectedPayment({ id: paymentId, amount });
    setRefundModalOpen(true);
  };

  const closeRefundModal = () => {
    if (!refundingPayment) {
      setRefundModalOpen(false);
      setSelectedPayment(null);
    }
  };

  async function handleRefundConfirm(reason: string) {
    if (!selectedPayment) return;

    try {
      setRefundingPayment(true);
      
      const { auth } = await import('@/lib/firebase');
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in');
      }

      const token = await user.getIdToken();

      const res = await fetch('/api/admin/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          refundNote: reason || undefined
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to process refund');
      }

      toast(`Refund processed successfully! Refund ID: ${result.refundId}`, 'success');
      closeRefundModal();
      fetchPayments(); // Refresh the list
    } catch (error: any) {
      console.error('Refund error:', error);
      toast(error.message || 'Failed to process refund', 'error');
    } finally {
      setRefundingPayment(false);
    }
  }

  if (loading) {
    return (
      <PageHeader 
        title="Payments & Revenue"
        description="View payment transactions and revenue analytics"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <TableSkeleton rows={5} columns={6} />
        </div>
      </PageHeader>
    );
  }

  if (error) {
    return (
      <PageHeader 
        title="Payments & Revenue"
        description="View payment transactions and revenue analytics"
      >
        <ErrorDisplay error={error} onRetry={fetchPayments} />
      </PageHeader>
    );
  }

  return (
    <>
      <RefundModal
        isOpen={refundModalOpen}
        onClose={closeRefundModal}
        onConfirm={handleRefundConfirm}
        amount={selectedPayment?.amount || 0}
        isLoading={refundingPayment}
      />
      
      <PageHeader 
        title="Payments & Revenue"
        description="View payment transactions and revenue analytics"
      >
        <div className="text-gray-900">
      <PaymentFilters />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold">₹{data?.analytics?.totalRevenue?.toLocaleString('en-IN') || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm text-gray-500">Successful Payments</p>
              <p className="text-xl sm:text-2xl font-bold">{data?.analytics?.successfulPayments || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm text-gray-500">Failed Payments</p>
              <p className="text-xl sm:text-2xl font-bold">{data?.analytics?.failedPayments || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">Revenue by Plan Type</h2>
          <RevenueByPlanChart data={data?.analytics?.revenueByPlan || {}} />
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">Revenue Trend (Last 30 Days)</h2>
          <RevenueTrendChart data={data?.analytics?.dailyRevenue || []} />
        </div>
      </div>
      </div>

      {/* Search Bar - Above Table */}
      <PaymentSearch />

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Payment Transactions</h2>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.payments?.map((payment: any) => (
                <>
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(payment.id)
                          toast('Payment ID copied!', 'success')
                        }}
                        className="hover:text-blue-600 cursor-pointer"
                        title="Click to copy full ID"
                      >
                        {payment.id.slice(0, 8)}...
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(payment.userId)
                          toast('User ID copied!', 'success')
                        }}
                        className="hover:text-blue-600 cursor-pointer"
                        title="Click to copy full User ID"
                      >
                        {payment.userId?.slice(0, 8)}...
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(payment.campaignId)
                          toast('Campaign ID copied!', 'success')
                        }}
                        className="hover:text-blue-600 cursor-pointer"
                        title="Click to copy full Campaign ID"
                      >
                        {payment.campaignId?.slice(0, 8)}...
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">₹{payment.amount?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm">{payment.planType}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        payment.status === 'SUCCESS' || payment.status === 'success' ? 'bg-green-100 text-green-800' : 
                        payment.status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRow(payment.id)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          {expandedRows.has(payment.id) ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Details
                            </>
                          )}
                        </button>
                        {(payment.status === 'SUCCESS' || payment.status === 'success') && (
                          <button
                            onClick={() => openRefundModal(payment.id, payment.amount)}
                            disabled={refundingPayment}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedRows.has(payment.id) && (
                    <tr key={`${payment.id}-details`}>
                      <td colSpan={8} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Payment Details:</h4>
                            <div className="bg-white p-4 rounded border border-gray-200 text-sm text-gray-900">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <span className="font-medium">Payment ID:</span>
                                  <p className="font-mono text-xs mt-1">{payment.id}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Order ID:</span>
                                  <p className="font-mono text-xs mt-1">{payment.orderId || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Cashfree Order ID:</span>
                                  <p className="font-mono text-xs mt-1">{payment.cashfreeOrderId || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Status:</span>
                                  <p className="mt-1">{payment.status}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Amount:</span>
                                  <p className="mt-1">₹{payment.amount}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Plan Type:</span>
                                  <p className="mt-1">{payment.planType}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {payment.webhookData && (
                            <div>
                              <h4 className="font-semibold text-sm text-gray-700 mb-2">Webhook Data:</h4>
                              <pre className="bg-white p-4 rounded border border-gray-200 overflow-x-auto text-xs text-gray-900 font-mono">
                                {JSON.stringify(payment.webhookData, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {!payment.webhookData && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                              <p className="text-sm text-yellow-800">
                                ⚠️ No webhook data received yet. The payment may still be processing.
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
      </PageHeader>
    </>
  );
}

export default function AdminPaymentsPage() {
  return (
    <AdminErrorBoundary>
      <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
        <PaymentsContent />
      </Suspense>
    </AdminErrorBoundary>
  );
}
