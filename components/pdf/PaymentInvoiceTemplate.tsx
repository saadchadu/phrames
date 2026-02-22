import type { InvoiceData } from '@/lib/invoice'

interface PaymentInvoiceTemplateProps {
  data: InvoiceData
}

export default function PaymentInvoiceTemplate({ data }: PaymentInvoiceTemplateProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  // Design System Colors (Phrames)
  const colors = {
    primary: '#002400', // Dark Green
    accent: '#16A34A',  // Success Green
    text: '#111827',    // Primary Text
    secondary: '#6B7280', // Secondary Text
    muted: '#9CA3AF',   // Muted Text
    border: '#E5E7EB',  // Light Border
    bgLight: '#f2fff2', // Light Phrames Green
  }

  return (
    <div className="invoice-print-wrapper">
      <style dangerouslySetInnerHTML={{
        __html: `
            @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
            
            @page {
              size: A4;
              margin: 40px 50px;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              -webkit-font-smoothing: antialiased;
            }
            
            /* Hide global site elements for the PDF */
            nav, header, footer:not(.invoice-footer) {
              display: none !important;
            }
            
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

            .invoice-print-wrapper {
              background: white;
              width: 100%;
              min-height: 100vh;
            }
            
            .page-container {
              width: 100%;
              max-width: 100%;
              min-height: 900px;
              margin: 0 auto;
              padding: 0; 
              position: relative;
              display: flex;
              flex-direction: column;
            }

            .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 50px;
            }

            .header-left {
              flex: 1;
              padding-right: 20px;
            }

            .header-right {
              text-align: right;
            }

            .company-name-text {
              font-weight: 800;
              font-size: 20pt;
              margin-bottom: 8px;
              display: block;
              color: ${colors.primary};
              letter-spacing: -0.02em;
            }

            .address-line {
              font-size: 9pt;
              color: ${colors.text};
              margin-bottom: 4px;
            }

            .contact-line {
              font-size: 8.5pt;
              color: ${colors.secondary};
            }

            .invoice-title {
              font-size: 32pt;
              font-weight: 800;
              color: ${colors.primary};
              line-height: 1;
              margin-bottom: 12px;
              letter-spacing: -0.02em;
            }

            .invoice-meta {
              font-size: 9.5pt;
              color: ${colors.text};
              margin-bottom: 4px;
            }

            .meta-label {
              color: ${colors.secondary};
              margin-right: 8px;
            }

            .billing-wrapper {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 40px;
            }

            .bill-to {
              flex: 1;
              border-left: 3px solid ${colors.primary};
              padding-left: 14px;
            }

            .section-label {
              font-size: 8pt;
              font-weight: 700;
              color: ${colors.muted};
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin-bottom: 8px;
            }

            .client-name {
              font-size: 11pt;
              font-weight: 700;
              color: ${colors.text};
              margin-bottom: 4px;
            }

            .client-detail {
              font-size: 9pt;
              color: ${colors.secondary};
              line-height: 1.4;
            }

            .amount-due-box {
              background: ${colors.bgLight};
              border: 1px solid #e0f2e0;
              box-shadow: 0 2px 8px rgba(0,0,0,0.03);
              border-radius: 8px;
              padding: 16px 24px;
              text-align: right;
              min-width: 200px;
            }

            .amount-label {
              font-size: 8pt;
              font-weight: 700;
              color: ${colors.secondary};
              text-transform: uppercase;
              margin-bottom: 4px;
              letter-spacing: 0.05em;
            }

            .amount-value {
              font-size: 20pt;
              font-weight: 800;
              color: ${colors.primary};
              letter-spacing: -0.02em;
            }

            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 32px;
            }

            .items-table thead {
              background: ${colors.primary};
              color: white;
              display: table-header-group;
            }

            .items-table th {
              padding: 12px 16px;
              text-align: left;
              font-size: 8pt;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }

            .items-table th.right {
              text-align: right;
            }

            .items-table th.center {
              text-align: center;
            }

            .items-table tbody tr {
              border-bottom: 1px solid ${colors.border};
              page-break-inside: avoid;
            }

            .items-table td {
              padding: 16px 12px;
              font-size: 9.5pt;
              color: ${colors.text};
              vertical-align: top;
            }

            .items-table td.right {
              text-align: right;
              font-variant-numeric: tabular-nums;
            }

            .items-table td.center {
              text-align: center;
            }

            .item-desc {
              font-weight: 600;
              color: ${colors.primary};
              font-size: 10.5pt;
              margin-bottom: 4px;
            }
            
            .item-meta {
              font-size: 8.5pt;
              color: ${colors.secondary};
              margin-bottom: 2px;
            }

            .summary-wrapper {
              margin-bottom: 48px;
              margin-top: 40px;
              page-break-inside: avoid;
            }

            .summary-block {
              width: 320px;
              margin-left: auto;
            }

            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              font-size: 9.5pt;
            }

            .summary-row.total {
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid ${colors.border};
            }

            .summary-label {
              color: ${colors.secondary};
            }

            .summary-value {
              color: ${colors.text};
              font-weight: 600;
              font-variant-numeric: tabular-nums;
            }

            .summary-total-value {
               font-size: 20pt;
               font-weight: 800;
               letter-spacing: -0.02em;
               color: ${colors.primary};
               line-height: 1;
            }

            .bottom-section {
              margin-top: 40px;
              page-break-inside: avoid;
            }

            .terms-payment-grid {
              display: grid;
              grid-template-columns: 1fr auto;
              gap: 40px;
              align-items: start;
            }

            .terms-column {
               max-width: 80%; 
            }
            
            .terms-text {
              font-size: 9pt;
              color: ${colors.secondary};
              line-height: 1.5;
            }

            .invoice-footer {
              margin-top: auto;
              padding-top: 20px;
              border-top: 1px solid ${colors.border};
              width: 100%;
              page-break-inside: avoid;
            }
            
            .footer-inner {
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: ${colors.secondary};
              font-size: 8.5pt;
            }

            .invoice-footer a {
              color: ${colors.text};
              text-decoration: none;
              font-weight: 600;
            }
            
            .invoice-watermark {
               position: fixed;
               top: 45%;
               left: 50%;
               transform: translate(-50%, -50%) rotate(-30deg);
               font-size: 120px;
               font-weight: 800;
               letter-spacing: 10px;
               opacity: 0.03;
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
            <div className="company-name-text">{data.companyDetails.name}</div>
            <div className="address-line">{data.companyDetails.address}</div>
            <div className="contact-line">
              {data.companyDetails.email}
              {data.companyDetails.gstin && ` | GSTIN: ${data.companyDetails.gstin}`}
            </div>
          </div>

          <div className="header-right">
            <div className="invoice-title">INVOICE</div>
            <div className="invoice-meta">#{data.invoiceNumber}</div>
            <div className="invoice-meta">
              <span className="meta-label">Issued:</span> {formatDate(data.invoiceDate)}
            </div>
            <div className="invoice-meta">
              <span className="meta-label">Order ID:</span> {data.orderId}
            </div>
          </div>
        </div>

        {/* 2. Billing & Amount */}
        <div className="billing-wrapper">
          <div className="bill-to">
            <div className="section-label">BILL TO</div>
            <div className="client-name">{data.userName}</div>
            <div className="client-detail">
              {data.userEmail}
            </div>
          </div>

          <div className="amount-due-box">
            <div className="amount-label">Amount Paid</div>
            <div className="amount-value">{formatCurrency(data.totalAmount)}</div>
          </div>
        </div>

        {/* 3. Items Table */}
        <table className="items-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Description</th>
              <th className="center" style={{ width: '15%' }}>Qty</th>
              <th className="right" style={{ width: '15%' }}>Rate</th>
              <th className="right" style={{ width: '20%' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="item-desc">Campaign Activation - {data.planName}</div>
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

        {/* 4. Summary Section */}
        <div className="summary-wrapper">
          <div className="summary-block">
            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">{formatCurrency(data.amount)}</span>
            </div>

            {data.gstRate > 0 && (
              <div className="summary-row">
                <span className="summary-label">GST ({data.gstRate}%)</span>
                <span className="summary-value">{formatCurrency(data.gstAmount)}</span>
              </div>
            )}

            <div className="summary-row total">
              <span className="summary-label" style={{ fontWeight: 700 }}>TOTAL</span>
              <span className="summary-total-value">{formatCurrency(data.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* 5. Terms & Payment */}
        <div className="bottom-section">
          <div className="terms-payment-grid">
            <div className="terms-column">
              <div className="section-label" style={{ color: colors.accent }}>Payment Received</div>
              <div className="terms-text" style={{ color: colors.accent, fontWeight: 500, marginBottom: '16px' }}>
                Thank you for your business! This invoice has been fully paid.
              </div>

              <div className="section-label">Terms & Conditions</div>
              <div className="terms-text">
                This is a computer generated invoice and requires no signature.<br />
                Payment ID: {data.paymentId}
              </div>
            </div>
          </div>
        </div>

        {/* 6. Footer */}
        <div className="invoice-footer">
          <div className="footer-inner">
            <div>
              System-generated invoice for {data.companyDetails.name}
            </div>
            <div>
              Powered by <a href="https://phrames.cleffon.com" target="_blank">Phrames</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
