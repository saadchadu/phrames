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
    return `₹${amount.toFixed(2)}`
  }

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Invoice {data.invoiceNumber}</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #1a1a1a;
            padding: 40px;
            background: white;
          }
          
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
          }
          
          .header {
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #002400;
          }
          
          .company-name {
            font-size: 32px;
            font-weight: bold;
            color: #002400;
            margin-bottom: 8px;
          }
          
          .company-details {
            font-size: 12px;
            color: #666;
            line-height: 1.8;
          }
          
          .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #002400;
            margin: 30px 0 20px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .invoice-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .meta-group {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
          }
          
          .meta-label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          
          .meta-value {
            font-size: 14px;
            color: #1a1a1a;
            font-weight: 600;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #002400;
            margin: 30px 0 15px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #f2fff2;
          }
          
          .billing-section {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          
          .billing-name {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 4px;
          }
          
          .billing-email {
            font-size: 14px;
            color: #666;
          }
          
          .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          .table thead {
            background: #002400;
            color: white;
          }
          
          .table th {
            padding: 12px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .table th:last-child {
            text-align: right;
          }
          
          .table td {
            padding: 15px 12px;
            border-bottom: 1px solid #e0e0e0;
          }
          
          .table td:last-child {
            text-align: right;
            font-weight: 600;
          }
          
          .description-main {
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 4px;
          }
          
          .description-sub {
            font-size: 12px;
            color: #666;
          }
          
          .table-subtotal {
            background: #f9f9f9;
          }
          
          .table-total {
            background: #f2fff2;
            font-weight: bold;
            font-size: 16px;
          }
          
          .table-total td {
            padding: 18px 12px;
            border-bottom: none;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            text-align: center;
            font-size: 12px;
            color: #666;
            line-height: 1.8;
          }
          
          .footer-note {
            margin-bottom: 8px;
          }
          
          .footer-thanks {
            color: #002400;
            font-weight: 600;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .invoice-container {
              max-width: 100%;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="invoice-container">
          {/* Header */}
          <div className="header">
            <div className="company-name">{data.companyDetails.name}</div>
            <div className="company-details">
              {data.companyDetails.address}<br />
              Email: {data.companyDetails.email}
              {data.companyDetails.gstin && (
                <>
                  <br />
                  GSTIN: {data.companyDetails.gstin}
                </>
              )}
            </div>
          </div>

          {/* Invoice Title */}
          <div className="invoice-title">Tax Invoice</div>

          {/* Invoice Meta Information */}
          <div className="invoice-meta">
            <div className="meta-group">
              <div className="meta-label">Invoice Number</div>
              <div className="meta-value">{data.invoiceNumber}</div>
            </div>
            <div className="meta-group">
              <div className="meta-label">Invoice Date</div>
              <div className="meta-value">{formatDate(data.invoiceDate)}</div>
            </div>
            <div className="meta-group">
              <div className="meta-label">Payment ID</div>
              <div className="meta-value">{data.paymentId}</div>
            </div>
            <div className="meta-group">
              <div className="meta-label">Order ID</div>
              <div className="meta-value">{data.orderId}</div>
            </div>
          </div>

          {/* Billing To */}
          <div className="section-title">Billing To</div>
          <div className="billing-section">
            <div className="billing-name">{data.userName}</div>
            <div className="billing-email">{data.userEmail}</div>
          </div>

          {/* Service Details */}
          <div className="section-title">Service Details</div>
          <table className="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="description-main">
                    Campaign Activation - {data.planName}
                  </div>
                  <div className="description-sub">
                    Campaign: {data.campaignName}
                  </div>
                  <div className="description-sub">
                    Validity: {data.validityDays} days
                  </div>
                  <div className="description-sub">
                    Activation: {formatDate(data.activationDate)}
                  </div>
                  {data.expiryDate && (
                    <div className="description-sub">
                      Expires: {formatDate(data.expiryDate)}
                    </div>
                  )}
                </td>
                <td>{formatCurrency(data.amount)}</td>
              </tr>
              {data.gstRate > 0 && (
                <tr className="table-subtotal">
                  <td>GST ({data.gstRate}%)</td>
                  <td>{formatCurrency(data.gstAmount)}</td>
                </tr>
              )}
              <tr className="table-total">
                <td>Total Amount</td>
                <td>{formatCurrency(data.totalAmount)}</td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div className="footer">
            <div className="footer-note">
              This is a system-generated invoice for {data.companyDetails.name}.
            </div>
            <div className="footer-note">
              No signature is required.
            </div>
            <div className="footer-thanks">
              Thank you for using {data.companyDetails.name}!
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
