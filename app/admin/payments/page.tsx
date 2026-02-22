'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { DollarSign, TrendingUp, ChevronDown, ChevronUp, Copy, Download } from 'lucide-react';
import PaymentFilters from '@/components/admin/PaymentFilters';
import RevenueByPlanChart from '@/components/admin/RevenueByPlanChart';
import RevenueTrendChart from '@/components/admin/RevenueTrendChart';
import AdminErrorBoundary, { ErrorDisplay } from '@/components/admin/AdminErrorBoundary';
import { TableSkeleton, StatsCardSkeleton, ChartSkeleton } from '@/components/admin/LoadingState';
import PageHeader from '@/components/admin/PageHeader';
import RefundModal from '@/components/admin/RefundModal';
import { toast } from '@/components/ui/toaster';
import ExpandableDataTable, { ExpandableColumn } from '@/components/admin/ExpandableDataTable';
import React from 'react';

function PaymentsContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<{ id: string; amount: number } | null>(null);
  const [refundingPayment, setRefundingPayment] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const toggleRow = useCallback((id: string) => {
    setExpandedRows(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  }, []);

  const fetchPayments = useCallback(async () => {
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
      setError(error instanceof Error ? error.message : 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const openRefundModal = useCallback((paymentId: string, amount: number) => {
    setSelectedPayment({ id: paymentId, amount });
    setRefundModalOpen(true);
  }, []);

  const closeRefundModal = useCallback(() => {
    if (!refundingPayment) {
      setRefundModalOpen(false);
      setSelectedPayment(null);
    }
  }, [refundingPayment]);

  const handleRefundConfirm = useCallback(async (reason: string) => {
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
      toast(error.message || 'Failed to process refund', 'error');
    } finally {
      setRefundingPayment(false);
    }
  }, [selectedPayment, closeRefundModal, fetchPayments]);

  const handleDownloadInvoice = async (payment: any) => {
    try {
      setDownloadingInvoice(payment.id);

      const { auth } = await import('@/lib/firebase');
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in');
      }

      const token = await user.getIdToken();

      const response = await fetch(`/api/invoice/${payment.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${payment.invoiceNumber || payment.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast('Invoice downloaded successfully', 'success');
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      toast(error.message || 'Failed to download invoice', 'error');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast(`${label} copied!`, 'success');
  };

  const columns: ExpandableColumn<any>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      render: (payment) => (
        <button
          onClick={() => copyToClipboard(payment.id, 'Payment ID')}
          className="hover:text-blue-600 cursor-pointer font-mono text-xs"
          title="Click to copy full ID"
        >
          <div className="flex items-center gap-1">
            {payment.id.slice(0, 8)}...
            <Copy className="h-3 w-3" />
          </div>
        </button>
      ),
    },
    {
      key: 'userId',
      header: 'User ID',
      sortable: true,
      render: (payment) => (
        <button
          onClick={() => copyToClipboard(payment.userId, 'User ID')}
          className="hover:text-blue-600 cursor-pointer font-mono text-xs"
          title="Click to copy full User ID"
        >
          <div className="flex items-center gap-1">
            {payment.userId?.slice(0, 8)}...
            <Copy className="h-3 w-3" />
          </div>
        </button>
      ),
    },
    {
      key: 'campaignId',
      header: 'Campaign ID',
      sortable: true,
      render: (payment) => (
        <button
          onClick={() => copyToClipboard(payment.campaignId, 'Campaign ID')}
          className="hover:text-blue-600 cursor-pointer font-mono text-xs"
          title="Click to copy full Campaign ID"
        >
          <div className="flex items-center gap-1">
            {payment.campaignId?.slice(0, 8)}...
            <Copy className="h-3 w-3" />
          </div>
        </button>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (payment) => (
        <div className="font-medium">₹{payment.amount?.toLocaleString('en-IN')}</div>
      ),
    },
    {
      key: 'planType',
      header: 'Plan',
      sortable: true,
      render: (payment) => (
        <div className="text-sm">{payment.planType}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (payment) => (
        <span className={`px-2 py-1 text-xs rounded-full ${payment.status === 'SUCCESS' || payment.status === 'success' ? 'bg-green-100 text-green-800' :
          payment.status === 'refunded' ? 'bg-purple-100 text-purple-800' :
            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
          }`}>
          {payment.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (payment) => (
        <div className="text-sm text-gray-500">
          {new Date(payment.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (payment) => (
        <div className="flex items-center gap-3">
          {['success', 'refunded'].includes((payment.status || '').toLowerCase()) && (
            <button
              onClick={() => handleDownloadInvoice(payment)}
              disabled={downloadingInvoice === payment.id}
              className="text-emerald-600 hover:text-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-medium transition-colors"
              title="Download Invoice"
            >
              {downloadingInvoice === payment.id ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-600"></div>
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
            </button>
          )}
          {['success'].includes((payment.status || '').toLowerCase()) && (
            <button
              onClick={() => openRefundModal(payment.id, payment.amount)}
              disabled={refundingPayment}
              className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors"
            >
              Refund
            </button>
          )}
        </div>
      ),
    },
  ];

  const renderExpandableContent = (payment: any) => (
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
  );

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
                  <p className="text-xl sm:text-2xl font-bold">₹0</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm text-gray-500">Successful Payments</p>
                  <p className="text-xl sm:text-2xl font-bold">0</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm text-gray-500">Failed Payments</p>
                  <p className="text-xl sm:text-2xl font-bold">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">Revenue by Plan Type</h2>
              <RevenueByPlanChart data={{}} />
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">Revenue Trend (Last 30 Days)</h2>
              <RevenueTrendChart data={[]} />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Payment Transactions</h2>
          </div>
          <ExpandableDataTable
            columns={columns}
            data={(data?.payments || []).filter((payment: any) =>
              !['b2c6f3SIoWx4nL2phwVx', 'rmwLGEzN88TyWwJ5tWHf'].includes(payment.id)
            )}
            keyExtractor={(payment) => payment.id}
            emptyMessage="No payments found"
            isLoading={loading}
            defaultSort={{ key: 'createdAt', direction: 'desc' }}
            expandableContent={renderExpandableContent}
            expandedRows={expandedRows}
            onToggleRow={toggleRow}
          />
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
