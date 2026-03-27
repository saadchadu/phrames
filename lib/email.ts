import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM || 'Phrames <support@phrames.cleffon.com>'

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set, skipping email')
    return
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html })
  } catch (err) {
    console.error('[email] Failed to send email:', err)
  }
}

// ─── Templates ────────────────────────────────────────────────────────────────

function base(content: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f5f5;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:#002400;padding:24px 32px;">
<span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Phrames</span>
</td></tr>
<tr><td style="padding:32px;">${content}</td></tr>
<tr><td style="padding:16px 32px 24px;border-top:1px solid #f0f0f0;color:#999;font-size:12px;">
© ${new Date().getFullYear()} Phrames. All rights reserved.
</td></tr>
</table>
</td></tr></table>
</body></html>`
}

function btn(text: string, url: string) {
  return `<a href="${url}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#002400;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">${text}</a>`
}

export function sendPaymentConfirmationEmail(to: string, data: {
  userName: string
  campaignName: string
  planName: string
  amount: number
  invoiceNumber: string
  orderId: string
}) {
  const html = base(`
    <h2 style="margin:0 0 8px;color:#002400;font-size:22px;">Payment Confirmed</h2>
    <p style="color:#555;margin:0 0 24px;">Hi ${data.userName}, your payment was successful and your campaign is now active.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:8px;padding:16px;">
      <tr><td style="padding:6px 0;color:#777;font-size:14px;">Campaign</td><td style="padding:6px 0;color:#002400;font-weight:600;font-size:14px;text-align:right;">${data.campaignName}</td></tr>
      <tr><td style="padding:6px 0;color:#777;font-size:14px;">Plan</td><td style="padding:6px 0;color:#002400;font-weight:600;font-size:14px;text-align:right;">${data.planName}</td></tr>
      <tr><td style="padding:6px 0;color:#777;font-size:14px;">Amount Paid</td><td style="padding:6px 0;color:#002400;font-weight:600;font-size:14px;text-align:right;">₹${data.amount}</td></tr>
      <tr><td style="padding:6px 0;color:#777;font-size:14px;">Invoice #</td><td style="padding:6px 0;color:#002400;font-size:14px;text-align:right;">${data.invoiceNumber}</td></tr>
    </table>
    ${btn('View Dashboard', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)}
  `)
  return sendEmail(to, 'Payment Confirmed – Your campaign is live', html)
}

export function sendSupportTicketEmail(to: string, data: {
  name: string
  ticketId: string
  subject: string
}) {
  const html = base(`
    <h2 style="margin:0 0 8px;color:#002400;font-size:22px;">We got your message</h2>
    <p style="color:#555;margin:0 0 24px;">Hi ${data.name}, your support ticket has been submitted. We'll get back to you as soon as possible.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:8px;padding:16px;">
      <tr><td style="padding:6px 0;color:#777;font-size:14px;">Ticket ID</td><td style="padding:6px 0;color:#002400;font-weight:600;font-size:14px;text-align:right;">${data.ticketId}</td></tr>
      <tr><td style="padding:6px 0;color:#777;font-size:14px;">Subject</td><td style="padding:6px 0;color:#002400;font-size:14px;text-align:right;">${data.subject}</td></tr>
    </table>
    ${btn('View My Tickets', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/support`)}
  `)
  return sendEmail(to, `Support Ticket Received – ${data.ticketId}`, html)
}

export function sendCampaignStatusEmail(to: string, data: {
  userName: string
  campaignName: string
  status: 'reactivated' | 'deactivated'
  reason?: string
}) {
  const isActive = data.status === 'reactivated'
  const html = base(`
    <h2 style="margin:0 0 8px;color:#002400;font-size:22px;">Campaign ${isActive ? 'Activated' : 'Deactivated'}</h2>
    <p style="color:#555;margin:0 0 24px;">Hi ${data.userName}, your campaign <strong>${data.campaignName}</strong> has been ${isActive ? 'activated and is now live' : 'deactivated'}.</p>
    ${data.reason ? `<p style="color:#777;font-size:14px;background:#f9f9f9;border-radius:8px;padding:12px 16px;margin:0 0 16px;">Reason: ${data.reason}</p>` : ''}
    ${btn('View Campaign', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)}
  `)
  return sendEmail(to, `Your campaign has been ${isActive ? 'activated' : 'deactivated'}`, html)
}
