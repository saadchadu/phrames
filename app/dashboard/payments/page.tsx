'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'
import { Download, Eye, Calendar, CreditCard, CheckCircle, XCircle, Clock, ArrowUpDown } from 'lucide-react'
import { toast } from '@/components/ui/toaster'
import InvoiceDownloadToast from '@/components/pdf/InvoiceDownloadToast'

interface Payment {
  id: string
  invoiceNumber: string
  campaignName: string
  planName: string
  planType: string
  amount: number
  totalAmount: number
  status: string
  createdAt: Date
  expiresAt: Date | null
  orderId: string
}

export default function PaymentsPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'SUCCESS' | 'FAILED'>('all')
  const [downloading, setDownloading] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Payment; direction: 'asc' | 'desc' } | null>(null)

  useEffect(() => {
    if (user) {
      fetchPayments()
    }
  }, [user])

  const fetchPayments = async () => {
    if (!user) return

    try {
      setLoading(true)
      const paymentsRef = collection(db, 'payments')
      const q = query(
        paymentsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const paymentsData: Payment[] = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          invoiceNumber: data.invoiceNumber || 'N/A',
          campaignName: data.campaignName || data.metadata?.campaignName || 'Campaign',
          planName: data.planName || data.planType || 'Plan',
          planType: data.planType,
          amount: data.baseAmount || data.amount || 0,
          totalAmount: data.totalAmount || data.amount || 0,
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate() || null,
          orderId: data.orderId || ''
        }
      })

      setPayments(paymentsData)
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast('Failed to load payment history', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async (paymentId: string, invoiceNumber: string) => {
    try {
      setDownloading(paymentId)
      setShowToast(true)

      const token = await user?.getIdToken()
      if (!token) {
        toast('Authentication required', 'error')
        return
      }

      const response = await fetch(`/api/invoice/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Invoice API error:', error)
        throw new Error(error.error || error.details || 'Failed to download invoice')
      }

      // Download the PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Invoice-${invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast('Invoice downloaded successfully', 'success')
    } catch (error: any) {
      console.error('Error downloading invoice:', error)
      toast(error.message || 'Failed to download invoice', 'error')
      setShowToast(false)
    } finally {
      setDownloading(null)
    }
  }

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toUpperCase()
    if (normalizedStatus === 'SUCCESS') {
      return <CheckCircle className="w-5 h-5 text-secondary" />
    } else if (normalizedStatus === 'FAILED') {
      return <XCircle className="w-5 h-5 text-red-600" />
    } else {
      return <Clock className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toUpperCase()
    const baseClasses = 'px-3 py-1.5 rounded-lg text-xs font-semibold'

    if (normalizedStatus === 'SUCCESS') {
      return <span className={`${baseClasses} bg-[#f2fff2] text-secondary border border-secondary/20`}>Success</span>
    } else if (normalizedStatus === 'FAILED') {
      return <span className={`${baseClasses} bg-red-50 text-red-700 border border-red-200`}>Failed</span>
    } else {
      return <span className={`${baseClasses} bg-yellow-50 text-yellow-700 border border-yellow-200`}>Pending</span>
    }
  }

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true
    return payment.status.toUpperCase() === filter
  })

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (!sortConfig) return 0

    const { key, direction } = sortConfig
    const modifier = direction === 'asc' ? 1 : -1

    if (key === 'createdAt' || key === 'expiresAt') {
      const aVal = a[key]?.getTime() || 0
      const bVal = b[key]?.getTime() || 0
      return (aVal - bVal) * modifier
    }

    const aVal = a[key] ?? ''
    const bVal = b[key] ?? ''

    if (aVal < bVal) return -1 * modifier
    if (aVal > bVal) return 1 * modifier
    return 0
  })

  const handleSort = (key: keyof Payment) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const SortIndicator = ({ sortKey }: { sortKey: keyof Payment }) => {
    if (sortConfig?.key !== sortKey) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 transition-opacity" />
    }
    return <ArrowUpDown className={`w-3.5 h-3.5 text-secondary transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
  }

  const SortableHeader = ({ title, sortKey }: { title: string, sortKey: keyof Payment }) => (
    <th
      onClick={() => handleSort(sortKey)}
      className="px-6 py-4 text-left text-xs font-semibold text-primary/70 uppercase tracking-wider cursor-pointer hover:bg-[#00240008] transition-colors group select-none"
    >
      <div className="flex items-center gap-1.5">
        {title}
        <SortIndicator sortKey={sortKey} />
      </div>
    </th>
  )

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#f2fff233] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f2fff233]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] font-bold text-primary leading-tight">
              Payment History
            </h1>
            <p className="text-primary/70 text-sm sm:text-base font-normal leading-normal">
              View and download your payment invoices
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-medium transition-all shadow-sm ${filter === 'all'
              ? 'bg-secondary text-primary'
              : 'bg-white text-primary/70 hover:bg-gray-50 border border-[#00240020]'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('SUCCESS')}
            className={`px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-medium transition-all shadow-sm ${filter === 'SUCCESS'
              ? 'bg-secondary text-primary'
              : 'bg-white text-primary/70 hover:bg-gray-50 border border-[#00240020]'
              }`}
          >
            Success
          </button>
          <button
            onClick={() => setFilter('FAILED')}
            className={`px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-medium transition-all shadow-sm ${filter === 'FAILED'
              ? 'bg-secondary text-primary'
              : 'bg-white text-primary/70 hover:bg-gray-50 border border-[#00240020]'
              }`}
          >
            Failed
          </button>
        </div>

        {/* Payments List */}
        {filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-4 sm:gap-6 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f2fff2] rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-primary/30" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-primary/60 text-xl sm:text-2xl font-bold leading-tight text-center">
                {filter === 'all' ? 'No payments yet' : `No ${filter.toLowerCase()} payments`}
              </h3>
              <p className="text-primary/50 text-sm sm:text-base font-normal leading-normal text-center max-w-md px-4">
                {filter === 'all'
                  ? "You haven't made any payments yet."
                  : `You don't have any ${filter.toLowerCase()} payments.`
                }
              </p>
            </div>
            {filter === 'all' && (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 active:scale-95 text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all shadow-sm"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#00240010]">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-[#f2fff2]">
                  <tr>
                    <SortableHeader title="Invoice" sortKey="invoiceNumber" />
                    <SortableHeader title="Campaign" sortKey="campaignName" />
                    <SortableHeader title="Plan" sortKey="planName" />
                    <SortableHeader title="Amount" sortKey="totalAmount" />
                    <SortableHeader title="Status" sortKey="status" />
                    <SortableHeader title="Date" sortKey="createdAt" />
                    <SortableHeader title="Expiry" sortKey="expiresAt" />
                    <th className="px-6 py-4 text-right text-xs font-semibold text-primary/70 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {sortedPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-[#f2fff210] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-primary">
                          {payment.invoiceNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-primary max-w-xs truncate">
                          {payment.campaignName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary/70">{payment.planName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-primary">
                          {formatCurrency(payment.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary/70">{formatDate(payment.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary/70">
                          {payment.expiresAt ? formatDate(payment.expiresAt) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/payments/${payment.id}`}
                            className="text-primary hover:text-secondary p-2 hover:bg-[#f2fff2] rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {payment.status.toUpperCase() === 'SUCCESS' && (
                            <button
                              onClick={() => handleDownloadInvoice(payment.id, payment.invoiceNumber)}
                              disabled={downloading === payment.id}
                              className="text-secondary hover:text-secondary/80 p-2 hover:bg-[#f2fff2] rounded-lg transition-all disabled:opacity-50"
                              title="Download Invoice"
                            >
                              {downloading === payment.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary"></div>
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {sortedPayments.map((payment) => (
                <div key={payment.id} className="p-4 hover:bg-[#f2fff210] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-primary mb-1">
                        {payment.invoiceNumber}
                      </div>
                      <div className="text-sm text-primary/70">{payment.campaignName}</div>
                    </div>
                    {getStatusIcon(payment.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <div className="text-primary/50 text-xs">Plan</div>
                      <div className="font-medium text-primary">{payment.planName}</div>
                    </div>
                    <div>
                      <div className="text-primary/50 text-xs">Amount</div>
                      <div className="font-semibold text-primary">{formatCurrency(payment.totalAmount)}</div>
                    </div>
                    <div>
                      <div className="text-primary/50 text-xs">Date</div>
                      <div className="font-medium text-primary/70">{formatDate(payment.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-primary/50 text-xs">Expiry</div>
                      <div className="font-medium text-primary/70">
                        {payment.expiresAt ? formatDate(payment.expiresAt) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/payments/${payment.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-primary border border-[#00240020] rounded-xl hover:bg-gray-50 transition-all text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    {payment.status.toUpperCase() === 'SUCCESS' && (
                      <button
                        onClick={() => handleDownloadInvoice(payment.id, payment.invoiceNumber)}
                        disabled={downloading === payment.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-primary rounded-xl hover:bg-secondary/90 transition-all disabled:opacity-50 text-sm font-medium"
                      >
                        {downloading === payment.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Invoice
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Download Toast */}
      {showToast && (
        <InvoiceDownloadToast
          onComplete={() => setShowToast(false)}
        />
      )}
    </div>
  )
}
