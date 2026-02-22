'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Download, ArrowLeft, CheckCircle, XCircle, Clock, Calendar, CreditCard, FileText } from 'lucide-react'
import { toast } from '@/components/ui/toaster'
import InvoiceDownloadToast from '@/components/pdf/InvoiceDownloadToast'

interface PaymentDetail {
  id: string
  invoiceNumber: string
  campaignName: string
  campaignId: string
  planName: string
  planType: string
  amount: number
  gstRate?: number
  gstAmount: number
  totalAmount: number
  status: string
  createdAt: Date
  completedAt: Date | null
  expiresAt: Date | null
  orderId: string
  cashfreePaymentId: string
  userName: string
  userEmail: string
}

export default function PaymentDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const paymentId = params.paymentId as string

  const [payment, setPayment] = useState<PaymentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (user && paymentId) {
      fetchPaymentDetail()
    }
  }, [user, paymentId])

  const fetchPaymentDetail = async () => {
    if (!user) return

    try {
      setLoading(true)
      const paymentDoc = await getDoc(doc(db, 'payments', paymentId))

      if (!paymentDoc.exists()) {
        toast('Payment not found', 'error')
        router.push('/dashboard/payments')
        return
      }

      const data = paymentDoc.data()

      // Verify ownership
      if (data.userId !== user.uid) {
        toast('Access denied', 'error')
        router.push('/dashboard/payments')
        return
      }

      setPayment({
        id: paymentDoc.id,
        invoiceNumber: data.invoiceNumber || 'N/A',
        campaignName: data.campaignName || 'Campaign',
        campaignId: data.campaignId || '',
        planName: data.planName || data.planType || 'Plan',
        planType: data.planType,
        amount: data.baseAmount || data.amount || 0,
        gstRate: data.gstRate !== undefined ? data.gstRate : 0,
        gstAmount: data.gstAmount || 0,
        totalAmount: data.totalAmount || data.amount || 0,
        status: data.status || 'pending',
        createdAt: data.createdAt?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate() || null,
        expiresAt: data.expiresAt?.toDate() || null,
        orderId: data.orderId || '',
        cashfreePaymentId: data.cashfreePaymentId || '',
        userName: data.userName || '',
        userEmail: data.userEmail || ''
      })
    } catch (error) {
      console.error('Error fetching payment:', error)
      toast('Failed to load payment details', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async () => {
    if (!payment) return

    try {
      setDownloading(true)
      setShowToast(true)

      const token = await user?.getIdToken()
      if (!token) {
        toast('Authentication required', 'error')
        setShowToast(false)
        return
      }

      const response = await fetch(`/api/invoice/${payment.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to download invoice')
      }

      // Download the PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Invoice-${payment.invoiceNumber}.pdf`
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
      setDownloading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`
  }

  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toUpperCase()
    if (normalizedStatus === 'SUCCESS') {
      return {
        icon: <CheckCircle className="w-6 h-6" />,
        color: 'text-secondary',
        bg: 'bg-[#f2fff2]',
        border: 'border-secondary/20',
        label: 'Success'
      }
    } else if (normalizedStatus === 'FAILED') {
      return {
        icon: <XCircle className="w-6 h-6" />,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        label: 'Failed'
      }
    } else {
      return {
        icon: <Clock className="w-6 h-6" />,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        label: 'Pending'
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#f2fff233] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!payment) {
    return null
  }

  const statusConfig = getStatusConfig(payment.status)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f2fff233] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/dashboard/payments"
          className="inline-flex items-center gap-2 text-primary/70 hover:text-primary mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payments
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-[#00240010]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Payment Details</h1>
              <p className="text-primary/70">Invoice: {payment.invoiceNumber}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
              {statusConfig.icon}
              <span className="font-semibold">{statusConfig.label}</span>
            </div>
          </div>

          {/* Download Invoice Button */}
          {payment.status.toUpperCase() === 'SUCCESS' && (
            <button
              onClick={handleDownloadInvoice}
              disabled={downloading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-primary rounded-xl hover:bg-secondary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Invoice
                </>
              )}
            </button>
          )}
        </div>

        {/* Campaign Details */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-[#00240010]">
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-secondary" />
            Campaign Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-primary/50 mb-1">Campaign Name</div>
              <div className="font-semibold text-primary">{payment.campaignName}</div>
            </div>
            <div>
              <div className="text-sm text-primary/50 mb-1">Plan Type</div>
              <div className="font-semibold text-primary">{payment.planName}</div>
            </div>
            {payment.campaignId && (
              <div className="sm:col-span-2">
                <Link
                  href={`/dashboard/campaigns/${payment.campaignId}/edit`}
                  className="text-secondary hover:text-secondary/80 text-sm font-semibold inline-flex items-center gap-1"
                >
                  View Campaign →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-[#00240010]">
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-secondary" />
            Payment Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-primary/50 mb-1">Order ID</div>
                <div className="font-mono text-sm text-primary bg-[#f2fff210] px-3 py-2 rounded-lg">{payment.orderId}</div>
              </div>
              {payment.cashfreePaymentId && (
                <div>
                  <div className="text-sm text-primary/50 mb-1">Payment ID</div>
                  <div className="font-mono text-sm text-primary bg-[#f2fff210] px-3 py-2 rounded-lg">{payment.cashfreePaymentId}</div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-primary/70">
                  <span>Base Amount</span>
                  <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                </div>
                {payment.gstAmount > 0 && (
                  <div className="flex justify-between text-primary/70">
                    <span>GST ({payment.gstRate || 0}%)</span>
                    <span className="font-semibold">{formatCurrency(payment.gstAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-primary border-t border-gray-100 pt-2">
                  <span>Total Amount</span>
                  <span>{formatCurrency(payment.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#00240010]">
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary" />
            Timeline
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-primary">Payment Initiated</div>
                <div className="text-sm text-primary/70">{formatDate(payment.createdAt)}</div>
              </div>
            </div>

            {payment.completedAt && (
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${payment.status.toUpperCase() === 'SUCCESS' ? 'bg-secondary' : 'bg-red-600'
                  }`}></div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-primary">
                    Payment {payment.status.toUpperCase() === 'SUCCESS' ? 'Completed' : 'Failed'}
                  </div>
                  <div className="text-sm text-primary/70">{formatDate(payment.completedAt)}</div>
                </div>
              </div>
            )}

            {payment.expiresAt && payment.status.toUpperCase() === 'SUCCESS' && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary/30 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-primary">Campaign Expires</div>
                  <div className="text-sm text-primary/70">{formatDate(payment.expiresAt)}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Billing Information */}
        {(payment.userName || payment.userEmail) && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6 border border-[#00240010]">
            <h2 className="text-lg font-bold text-primary mb-4">Billing Information</h2>
            <div className="space-y-2">
              {payment.userName && (
                <div>
                  <div className="text-sm text-primary/50">Name</div>
                  <div className="font-semibold text-primary">{payment.userName}</div>
                </div>
              )}
              {payment.userEmail && (
                <div>
                  <div className="text-sm text-primary/50">Email</div>
                  <div className="font-semibold text-primary">{payment.userEmail}</div>
                </div>
              )}
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
