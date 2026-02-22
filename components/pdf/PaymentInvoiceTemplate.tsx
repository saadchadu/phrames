import type { InvoiceData } from '@/lib/invoice'

interface PaymentInvoiceTemplateProps {
  data: InvoiceData
}

export default function PaymentInvoiceTemplate({ data }: PaymentInvoiceTemplateProps) {
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const colors = {
    primary: '#002400',
    accent: '#16A34A',
    text: '#111827',
    secondary: '#6B7280',
    muted: '#9CA3AF',
    border: '#E5E7EB',
    bgLight: '#f2fff2',
  }

  return (
    <div className="invoice-print-wrapper">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        @page { size: A4; margin: 40px 50px; }

        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-font-smoothing: antialiased; }

        nav, header, footer:not(.invoice-footer) { display: none !important; }

        body {
          font-family: 'Manrope', sans-serif;
          font-size: 10pt;
          line-height: 1.5;
          color: ${colors.text};
          background: white !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100%;
        }

        .invoice-print-wrapper { background: white; width: 100%; min-height: 100vh; }

        .page-container {
          width: 100%;
          max-width: 100%;
          min-height: 900px;
          margin: 0 auto;
          padding: 0 0 80px 0;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        /* ── HEADER ── */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 44px;
        }

        .header-left { flex: 1; padding-right: 20px; }

        .header-right { text-align: right; flex-shrink: 0; }

        .company-logo { height: 26px; width: auto; margin-bottom: 16px; display: block; }

        .address-line { font-size: 9pt; color: ${colors.text}; line-height: 1.65; }

        .contact-line { font-size: 8.5pt; color: ${colors.secondary}; margin-top: 6px; }

        .invoice-title {
          font-size: 34pt;
          font-weight: 800;
          color: ${colors.primary};
          line-height: 1;
          margin-bottom: 14px;
          letter-spacing: -0.02em;
        }

        .invoice-number { font-size: 10pt; font-weight: 700; color: ${colors.primary}; margin-bottom: 8px; }

        .invoice-meta { font-size: 9pt; color: ${colors.text}; margin-bottom: 3px; }

        .meta-label { color: ${colors.secondary}; margin-right: 6px; }

        /* ── BILLING ── */
        .billing-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 36px;
          gap: 24px;
        }

        .bill-to {
          flex: 1;
          border-left: 3px solid ${colors.primary};
          padding-left: 14px;
        }

        .section-label {
          font-size: 7.5pt;
          font-weight: 700;
          color: ${colors.muted};
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }

        .client-name { font-size: 11pt; font-weight: 700; color: ${colors.text}; margin-bottom: 3px; }

        .client-detail { font-size: 9pt; color: ${colors.secondary}; }

        .amount-due-box {
          background: ${colors.bgLight};
          border: 1px solid #d1fad1;
          border-radius: 8px;
          padding: 14px 22px;
          text-align: right;
          min-width: 190px;
          flex-shrink: 0;
        }

        .amount-label {
          font-size: 7.5pt;
          font-weight: 700;
          color: ${colors.secondary};
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }

        .amount-value { font-size: 22pt; font-weight: 800; color: ${colors.primary}; letter-spacing: -0.02em; }

        /* ── TABLE ── */
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 0; }

        .items-table thead { background: ${colors.primary}; color: white; }

        .items-table th {
          padding: 11px 14px;
          text-align: left;
          font-size: 7.5pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .items-table th.right { text-align: right; }
        .items-table th.center { text-align: center; }

        .items-table tbody tr { border-bottom: 1px solid ${colors.border}; page-break-inside: avoid; }

        .items-table td { padding: 14px 14px; font-size: 9.5pt; color: ${colors.text}; vertical-align: top; }
        .items-table td.right { text-align: right; font-variant-numeric: tabular-nums; }
        .items-table td.center { text-align: center; }

        .item-desc { font-weight: 600; color: ${colors.primary}; font-size: 10pt; margin-bottom: 5px; }
        .item-meta  { font-size: 8.5pt; color: ${colors.secondary}; line-height: 1.6; }

        /* ── TOTAL ROW ── */
        .total-wrapper { width: 280px; margin-left: auto; margin-top: 0; }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 12px 14px;
          border-top: 2px solid ${colors.primary};
          margin-top: 4px;
        }

        .total-label { font-size: 9pt; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; letter-spacing: 0.06em; }

        .total-value { font-size: 18pt; font-weight: 800; color: ${colors.primary}; letter-spacing: -0.02em; }

        /* ── BOTTOM ── */
        .bottom-section { margin-top: 36px; page-break-inside: avoid; }

        .payment-received-label {
          font-size: 7.5pt;
          font-weight: 700;
          color: ${colors.accent};
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
        }

        .payment-received-text { font-size: 9pt; color: ${colors.accent}; font-weight: 500; margin-bottom: 18px; }

        .terms-label { font-size: 7.5pt; font-weight: 700; color: ${colors.muted}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }

        .terms-text { font-size: 8.5pt; color: ${colors.secondary}; line-height: 1.6; }

        /* ── FOOTER ── */
        .invoice-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 10px 50px;
          border-top: 1px solid ${colors.border};
          background: white;
          z-index: 100;
        }

        .footer-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: ${colors.secondary};
          font-size: 8pt;
        }

        .footer-inner a { color: ${colors.primary}; text-decoration: none; font-weight: 600; }

        /* ── WATERMARK ── */
        .invoice-watermark {
          position: fixed;
          top: 45%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 110px;
          font-weight: 800;
          letter-spacing: 10px;
          opacity: 0.035;
          text-transform: uppercase;
          z-index: 0;
          pointer-events: none;
          white-space: nowrap;
          user-select: none;
          color: ${colors.primary};
        }
      `}} />

      <div className="page-container">
        {/* Watermark */}
        <div className="invoice-watermark">PAID</div>

        {/* 1. Header */}
        <div className="header">
          <div className="header-left">
            <img src="/logos/Logo-black.svg" className="company-logo" alt="Phrames" />
            <div className="address-line">
              Cleffon Design Studio<br />
              Second Floor, Center Point Building<br />
              Kannur, Kerala, India 670002
            </div>
            <div className="contact-line">
              {data.companyDetails.email}
              {data.companyDetails.gstin && ` · GSTIN: ${data.companyDetails.gstin}`}
            </div>
          </div>

          <div className="header-right">
            <div className="invoice-title">INVOICE</div>
            <div className="invoice-number">#{data.invoiceNumber}</div>
            <div className="invoice-meta">
              <span className="meta-label">Issued:</span>{formatDate(data.invoiceDate)}
            </div>
            <div className="invoice-meta">
              <span className="meta-label">Order ID:</span>{data.orderId}
            </div>
          </div>
        </div>

        {/* 2. Billing & Amount */}
        <div className="billing-wrapper">
          <div className="bill-to">
            <div className="section-label">Bill To</div>
            <div className="client-name">{data.userName}</div>
            <div className="client-detail">{data.userEmail}</div>
          </div>

          <div className="amount-due-box">
            <div className="amount-label">Amount Paid</div>
            <div className="amount-value">{formatCurrency(data.amount)}</div>
          </div>
        </div>

        {/* 3. Items Table */}
        <table className="items-table">
          <thead>
            <tr>
              <th style={{ width: '52%' }}>Description</th>
              <th className="center" style={{ width: '12%' }}>Qty</th>
              <th className="right" style={{ width: '18%' }}>Rate</th>
              <th className="right" style={{ width: '18%' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="item-desc">Campaign Activation — {data.planName}</div>
                <div className="item-meta">Campaign: {data.campaignName}</div>
                <div className="item-meta">Validity: {data.validityDays} days</div>
                <div className="item-meta">Activation: {formatDate(data.activationDate)}</div>
                {data.expiryDate && (
                  <div className="item-meta">Expires: {formatDate(data.expiryDate)}</div>
                )}
              </td>
              <td className="center">1</td>
              <td className="right">{formatCurrency(data.amount)}</td>
              <td className="right">{formatCurrency(data.amount)}</td>
            </tr>
          </tbody>
        </table>

        {/* 4. Total */}
        <div className="total-wrapper">
          <div className="total-row">
            <span className="total-label">Total</span>
            <span className="total-value">{formatCurrency(data.amount)}</span>
          </div>
        </div>

        {/* 5. Terms & Payment */}
        <div className="bottom-section">
          <div className="payment-received-label">Payment Received</div>
          <div className="payment-received-text">Thank you for your business. This invoice has been fully paid.</div>

          <div className="terms-label">Terms &amp; Conditions</div>
          <div className="terms-text">
            This is a computer-generated invoice and requires no signature.<br />
            Payment ID: {data.paymentId}
          </div>
        </div>

        {/* 6. Footer */}
        <div className="invoice-footer">
          <div className="footer-inner">
            <span>System-generated invoice for {data.companyDetails.name}</span>
            <span>Powered by <a href="https://phrames.cleffon.com" target="_blank" rel="noopener noreferrer">Phrames</a></span>
          </div>
        </div>
      </div>
    </div>
  )
}
