import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM || 'Phrames <support@cleffon.com>'

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set, skipping email')
    return
  }
  const result = await resend.emails.send({ from: FROM, to, subject, html })
  if (result.error) {
    console.error('[email] Resend error:', result.error)
    throw new Error(result.error.message)
  }
  return result
}

// ─── Logo SVG (inline, white version) ────────────────────────────────────────
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 291.07 69.81" width="130" height="31" style="display:block;">
  <g>
    <g>
      <path fill="#fff" d="M67.55,40.35l-5.71,5.71v8.08c0,4.26-3.45,7.7-7.71,7.7h-8.07l-5.71,5.71c-3.01,3.01-7.89,3.01-10.9,0l-5.71-5.71h-8.07c-4.26,0-7.7-3.45-7.7-7.7v-8.07l-5.71-5.71c-3.01-3.01-3.01-7.89,0-10.9l5.71-5.71v-8.07c0-4.26,3.45-7.7,7.7-7.7h8.07l5.71-5.71c3.01-3.01,7.89-3.01,10.9,0l5.71,5.71h8.07c4.26,0,7.71,3.45,7.71,7.7v8.08l5.71,5.71c3.01,3.01,3.01,7.89,0,10.9Z"/>
      <path fill="#00dd78" d="M42.58,27.23l9.75,4.76c1.61,1.61,1.61,4.21,0,5.82l-9.75,4.76-4.76,9.75c-1.61,1.61-4.21,1.6-5.82,0l-4.76-9.75-9.75-4.77c-1.61-1.61-1.61-4.21,0-5.82l9.75-4.77,4.77-9.75c1.6-1.6,4.21-1.61,5.82,0l4.76,9.75Z"/>
    </g>
    <g>
      <path fill="#fff" d="M81.69,19.3h7.31l.26,4.79h.41c.65-1.61,1.74-2.9,3.27-3.86,1.53-.96,3.36-1.44,5.49-1.44,3.3,0,5.97,1.19,8.01,3.58,2.04,2.39,3.06,5.97,3.06,10.74s-1.02,8.31-3.06,10.71c-2.04,2.4-4.71,3.61-8.01,3.61-2.13,0-3.96-.49-5.49-1.47-1.53-.98-2.62-2.26-3.27-3.84h-.41v13.39h-7.57V19.3ZM100.06,39.31c1.12-1.32,1.67-3.39,1.67-6.21s-.56-4.88-1.67-6.21c-1.12-1.32-2.6-1.98-4.46-1.98-1.41,0-2.58.33-3.5.98-.93.65-1.61,1.5-2.06,2.55-.45,1.05-.67,2.16-.67,3.32v2.68c0,1.17.22,2.28.67,3.32.45,1.05,1.13,1.9,2.06,2.55s2.09.98,3.5.98c1.85,0,3.34-.66,4.46-1.98Z"/>
      <path fill="#fff" d="M112.24,9.36h7.57v14.94h.31c.75-1.82,1.92-3.19,3.5-4.12,1.58-.93,3.35-1.39,5.31-1.39,1.85,0,3.51.38,4.97,1.13,1.46.76,2.62,1.97,3.48,3.63.86,1.67,1.29,3.89,1.29,6.67v16.69h-7.57v-15.04c0-2.34-.41-4.07-1.24-5.2-.82-1.13-2.15-1.7-3.97-1.7-1.96,0-3.46.66-4.51,1.98-1.05,1.32-1.57,2.86-1.57,4.61v15.35h-7.57V9.36Z"/>
      <path fill="#fff" d="M142.83,19.3h6.85l.31,4.43h.26c.62-1.79,1.61-3.03,2.96-3.73,1.36-.7,2.91-1.06,4.66-1.06h1.55v7.11h-1.7c-2.54,0-4.38.56-5.51,1.67-1.13,1.12-1.73,2.7-1.8,4.76v14.42h-7.57v-27.61Z"/>
      <path fill="#fff" d="M162.2,43.79c-2.03-2.39-3.04-5.95-3.04-10.69s1.01-8.35,3.04-10.74c2.03-2.39,4.69-3.58,7.98-3.58,2.13,0,3.96.48,5.49,1.44,1.53.96,2.62,2.25,3.27,3.86h.41l.31-4.79h7.26v27.61h-7.57v-4.84h-.41c-.65,1.58-1.74,2.86-3.27,3.84-1.53.98-3.36,1.47-5.49,1.47-3.3,0-5.96-1.19-7.98-3.58ZM176.55,40.26c.91-.65,1.59-1.5,2.03-2.55.45-1.05.67-2.15.67-3.32v-2.63c0-1.2-.22-2.32-.67-3.35-.45-1.03-1.12-1.87-2.03-2.52-.91-.65-2.07-.98-3.48-.98-1.85,0-3.35.66-4.48,1.98-1.13,1.32-1.7,3.39-1.7,6.21s.57,4.83,1.7,6.16c1.13,1.32,2.63,1.98,4.48,1.98,1.41,0,2.57-.33,3.48-.98Z"/>
      <path fill="#fff" d="M191.35,19.3h7.31l.26,5h.31c.69-1.82,1.8-3.19,3.35-4.12,1.55-.93,3.25-1.39,5.1-1.39s3.67.46,5.25,1.39c1.58.93,2.75,2.52,3.5,4.79h.41c.65-2.06,1.81-3.61,3.48-4.64,1.67-1.03,3.55-1.55,5.64-1.55,1.79,0,3.38.38,4.79,1.13,1.41.76,2.53,1.97,3.37,3.63.84,1.67,1.26,3.89,1.26,6.67v16.69h-7.57v-15.04c0-2.34-.39-4.07-1.16-5.2-.77-1.13-2.02-1.7-3.73-1.7-1.82,0-3.24.66-4.25,1.98-1.01,1.32-1.52,2.86-1.52,4.61v15.35h-7.57v-15.04c0-2.34-.39-4.07-1.16-5.2-.77-1.13-2.02-1.7-3.73-1.7-1.85,0-3.28.66-4.28,1.98-1,1.32-1.49,2.86-1.49,4.61v15.35h-7.57v-27.61Z"/>
      <path fill="#fff" d="M244.28,45.62c-2.04-1.17-3.61-2.81-4.71-4.92-1.1-2.11-1.65-4.58-1.65-7.39,0-2.99.56-5.56,1.67-7.73,1.12-2.16,2.69-3.84,4.71-5.02,2.03-1.19,4.39-1.78,7.11-1.78,3.19,0,5.82.7,7.88,2.09,2.06,1.39,3.54,3.3,4.43,5.72.89,2.42,1.18,5.16.88,8.22h-19.21c-.03,2.2.53,3.89,1.7,5.07,1.17,1.18,2.69,1.78,4.58,1.78,1.44,0,2.67-.32,3.68-.95,1.01-.64,1.66-1.48,1.93-2.55h7.16c-.24,1.85-.94,3.47-2.09,4.84-1.15,1.37-2.64,2.45-4.46,3.22-1.82.77-3.9,1.16-6.23,1.16-2.88,0-5.35-.58-7.39-1.75ZM247.24,25.97c-1.06.98-1.67,2.31-1.8,3.99h11.74c-.1-1.85-.7-3.23-1.78-4.12-1.08-.89-2.41-1.34-3.99-1.34-1.72,0-3.11.49-4.17,1.47Z"/>
      <path fill="#fff" d="M269.26,44.87c-2.18-1.7-3.25-3.92-3.22-6.67h7.42c.03,1.48.56,2.53,1.57,3.17,1.01.64,2.26.95,3.73.95s2.71-.27,3.5-.8c.79-.53,1.18-1.26,1.18-2.19,0-1.27-.46-2.09-1.36-2.47-.91-.38-2.34-.7-4.3-.98-2.03-.27-3.88-.68-5.56-1.21-1.68-.53-3.01-1.35-3.99-2.45-.98-1.1-1.47-2.66-1.47-4.69,0-2.92,1.11-5.11,3.32-6.57,2.22-1.46,5.13-2.19,8.73-2.19s6.35.76,8.45,2.29c2.09,1.53,3.18,3.67,3.24,6.41h-7.42c0-1.17-.4-2.06-1.21-2.68-.81-.62-1.9-.93-3.27-.93s-2.47.27-3.19.8c-.72.53-1.08,1.23-1.08,2.09,0,1.03.46,1.75,1.39,2.16.93.41,2.4.76,4.43,1.03,1.44.21,2.82.46,4.12.75,1.3.29,2.46.74,3.48,1.34,1.01.6,1.82,1.43,2.42,2.47.6,1.05.9,2.41.9,4.1,0,3.02-1.12,5.25-3.35,6.67-2.23,1.43-5.29,2.14-9.17,2.14s-7.12-.85-9.3-2.55Z"/>
    </g>
  </g>
</svg>`

// ─── Base template ────────────────────────────────────────────────────────────
function base(content: string, accentColor = '#00dd78') {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0f2f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f0;">
<tr><td align="center" style="padding:40px 16px 48px;">

  <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

    <!-- Header -->
    <tr><td style="background:#002400;border-radius:16px 16px 0 0;padding:28px 36px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>${LOGO_SVG}</td>
          <td align="right">
            <span style="display:inline-block;background:${accentColor};color:#002400;font-size:11px;font-weight:700;letter-spacing:0.5px;padding:4px 10px;border-radius:20px;text-transform:uppercase;">Notification</span>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Accent bar -->
    <tr><td style="background:${accentColor};height:3px;"></td></tr>

    <!-- Body -->
    <tr><td style="background:#ffffff;padding:36px 36px 28px;border-radius:0;">
      ${content}
    </td></tr>

    <!-- Footer -->
    <tr><td style="background:#fafafa;border-radius:0 0 16px 16px;padding:20px 36px;border-top:1px solid #eee;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#aaa;font-size:12px;">© ${new Date().getFullYear()} Phrames · <a href="https://phrames.cleffon.com" style="color:#aaa;text-decoration:none;">phrames.cleffon.com</a></td>
          <td align="right" style="color:#aaa;font-size:12px;"><a href="mailto:support@cleffon.com" style="color:#aaa;text-decoration:none;">support@cleffon.com</a></td>
        </tr>
      </table>
    </td></tr>

  </table>
</td></tr>
</table>
</body></html>`
}

function btn(text: string, url: string, color = '#002400') {
  return `<a href="${url}" style="display:inline-block;margin-top:24px;padding:13px 28px;background:${color};color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;letter-spacing:0.2px;">${text}</a>`
}

function infoTable(rows: [string, string][]) {
  const cells = rows.map(([label, value]) => `
    <tr>
      <td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0;">${label}</td>
      <td style="padding:10px 0;color:#002400;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;">${value}</td>
    </tr>`).join('')
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faf8;border-radius:10px;padding:4px 16px;margin-top:20px;">${cells}</table>`
}

// ─── Email senders ────────────────────────────────────────────────────────────

export function sendPaymentConfirmationEmail(to: string, data: {
  userName: string
  campaignName: string
  planName: string
  amount: number
  invoiceNumber: string
  orderId: string
}) {
  const html = base(`
    <div style="display:inline-block;background:#e8faf2;border-radius:8px;padding:6px 12px;margin-bottom:20px;">
      <span style="color:#00a855;font-size:13px;font-weight:600;">✓ Payment Successful</span>
    </div>
    <h2 style="margin:0 0 10px;color:#002400;font-size:24px;font-weight:700;line-height:1.3;">Your campaign is live!</h2>
    <p style="color:#666;margin:0 0 4px;font-size:15px;line-height:1.6;">Hi ${data.userName}, your payment was confirmed and your campaign is now active.</p>
    ${infoTable([
      ['Campaign', data.campaignName],
      ['Plan', data.planName],
      ['Amount Paid', `₹${data.amount}`],
      ['Invoice #', data.invoiceNumber],
    ])}
    ${btn('View Dashboard', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`, '#002400')}
  `)
  return sendEmail(to, '✓ Payment Confirmed – Your campaign is live', html)
}

export function sendSupportTicketEmail(to: string, data: {
  name: string
  ticketId: string
  subject: string
}) {
  const html = base(`
    <div style="display:inline-block;background:#e8f0fe;border-radius:8px;padding:6px 12px;margin-bottom:20px;">
      <span style="color:#1a56db;font-size:13px;font-weight:600;">Support Ticket Created</span>
    </div>
    <h2 style="margin:0 0 10px;color:#002400;font-size:24px;font-weight:700;line-height:1.3;">We got your message</h2>
    <p style="color:#666;margin:0 0 4px;font-size:15px;line-height:1.6;">Hi ${data.name}, your support ticket has been submitted. Our team will get back to you as soon as possible.</p>
    ${infoTable([
      ['Ticket ID', data.ticketId],
      ['Subject', data.subject],
      ['Status', 'Open'],
    ])}
    ${btn('View My Tickets', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/support`, '#002400')}
  `, '#00dd78')
  return sendEmail(to, `Support Ticket Received – ${data.ticketId}`, html)
}

export function sendCampaignStatusEmail(to: string, data: {
  userName: string
  campaignName: string
  status: 'reactivated' | 'deactivated'
  reason?: string
}) {
  const isActive = data.status === 'reactivated'
  const badgeBg = isActive ? '#e8faf2' : '#fff0f0'
  const badgeColor = isActive ? '#00a855' : '#e53e3e'
  const badgeText = isActive ? '✓ Campaign Activated' : '⚠ Campaign Deactivated'
  const accent = isActive ? '#00dd78' : '#ff6b6b'

  const html = base(`
    <div style="display:inline-block;background:${badgeBg};border-radius:8px;padding:6px 12px;margin-bottom:20px;">
      <span style="color:${badgeColor};font-size:13px;font-weight:600;">${badgeText}</span>
    </div>
    <h2 style="margin:0 0 10px;color:#002400;font-size:24px;font-weight:700;line-height:1.3;">Campaign ${isActive ? 'is now live' : 'has been deactivated'}</h2>
    <p style="color:#666;margin:0 0 4px;font-size:15px;line-height:1.6;">Hi ${data.userName}, your campaign <strong style="color:#002400;">${data.campaignName}</strong> has been ${isActive ? 'activated and is now visible to the public' : 'deactivated'}.</p>
    ${data.reason ? `<div style="background:#fff8f0;border-left:3px solid #f6ad55;border-radius:0 8px 8px 0;padding:12px 16px;margin-top:16px;color:#744210;font-size:14px;">Reason: ${data.reason}</div>` : ''}
    ${btn('View Dashboard', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`, '#002400')}
  `, accent)
  return sendEmail(to, `Your campaign has been ${isActive ? 'activated' : 'deactivated'}`, html)
}

export function sendCampaignExpiryWarningEmail(to: string, data: {
  userName: string
  campaignName: string
  campaignSlug: string
  daysLeft: number
  expiresAt: string
}) {
  const isUrgent = data.daysLeft <= 1
  const accent = isUrgent ? '#ff6b35' : '#f6ad55'
  const html = base(`
    <div style="display:inline-block;background:${isUrgent ? '#fff3ee' : '#fffbeb'};border-radius:8px;padding:6px 12px;margin-bottom:20px;">
      <span style="color:${isUrgent ? '#c0392b' : '#b7791f'};font-size:13px;font-weight:600;">${isUrgent ? '🚨 Expires Tomorrow' : '⏰ Expiring Soon'}</span>
    </div>
    <h2 style="margin:0 0 10px;color:#002400;font-size:24px;font-weight:700;line-height:1.3;">Your campaign expires ${isUrgent ? 'tomorrow' : `in ${data.daysLeft} days`}</h2>
    <p style="color:#666;margin:0 0 4px;font-size:15px;line-height:1.6;">Hi ${data.userName}, your campaign <strong style="color:#002400;">${data.campaignName}</strong> will expire on <strong>${data.expiresAt}</strong>. Renew now to keep it live and continue collecting supporters.</p>
    ${infoTable([
      ['Campaign', data.campaignName],
      ['Expires On', data.expiresAt],
      ['Days Remaining', `${data.daysLeft} day${data.daysLeft !== 1 ? 's' : ''}`],
    ])}
    ${btn('Renew Campaign', `${process.env.NEXT_PUBLIC_APP_URL}/campaign/${data.campaignSlug}`, '#002400')}
  `, accent)
  return sendEmail(to, `${isUrgent ? '🚨' : '⏰'} Your campaign "${data.campaignName}" expires ${isUrgent ? 'tomorrow' : `in ${data.daysLeft} days`}`, html)
}

export function sendCampaignExpiredEmail(to: string, data: {
  userName: string
  campaignName: string
  campaignSlug: string
}) {
  const html = base(`
    <div style="display:inline-block;background:#fff0f0;border-radius:8px;padding:6px 12px;margin-bottom:20px;">
      <span style="color:#c0392b;font-size:13px;font-weight:600;">Campaign Expired</span>
    </div>
    <h2 style="margin:0 0 10px;color:#002400;font-size:24px;font-weight:700;line-height:1.3;">Your campaign has expired</h2>
    <p style="color:#666;margin:0 0 4px;font-size:15px;line-height:1.6;">Hi ${data.userName}, your campaign <strong style="color:#002400;">${data.campaignName}</strong> has expired and is no longer visible to the public.</p>
    <div style="background:#f8faf8;border-left:3px solid #00dd78;border-radius:0 8px 8px 0;padding:12px 16px;margin-top:20px;color:#555;font-size:14px;line-height:1.6;">
      Your campaign data is safe. Renewing will restore it immediately.
    </div>
    ${btn('Renew Campaign', `${process.env.NEXT_PUBLIC_APP_URL}/campaign/${data.campaignSlug}`, '#002400')}
  `, '#ff6b6b')
  return sendEmail(to, `Your campaign "${data.campaignName}" has expired`, html)
}

export function sendPasswordResetConfirmationEmail(to: string, data: {
  userName: string
}) {
  const html = base(`
    <div style="display:inline-block;background:#e8f0fe;border-radius:8px;padding:6px 12px;margin-bottom:20px;">
      <span style="color:#1a56db;font-size:13px;font-weight:600;">Password Reset</span>
    </div>
    <h2 style="margin:0 0 10px;color:#002400;font-size:24px;font-weight:700;line-height:1.3;">Password reset email sent</h2>
    <p style="color:#666;margin:0 0 4px;font-size:15px;line-height:1.6;">Hi ${data.userName}, we received a request to reset your Phrames password. Check your inbox for the reset link — it expires in 1 hour.</p>
    <div style="background:#f8faf8;border-left:3px solid #00dd78;border-radius:0 8px 8px 0;padding:12px 16px;margin-top:20px;color:#555;font-size:14px;line-height:1.6;">
      If you didn't request this, you can safely ignore this email. Your account is secure.
    </div>
    ${btn('Go to Login', `${process.env.NEXT_PUBLIC_APP_URL}/login`, '#002400')}
  `, '#4299e1')
  return sendEmail(to, 'Password reset requested – Phrames', html)
}
