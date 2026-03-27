import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'Phrames <support@cleffon.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://phrames.cleffon.com'

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

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary:   '#002400',
  accent:    '#00dd78',
  bg:        '#F2FFF2',
  white:     '#ffffff',
  border:    '#d4edda',
  muted:     '#f4fbf4',
  textBase:  '#1a3a1a',
  textMuted: '#5a7a5a',
  textLight: '#8aaa8a',
  red:       '#dc2626',
  redBg:     '#fef2f2',
  amber:     '#d97706',
  amberBg:   '#fffbeb',
  blue:      '#2563eb',
  blueBg:    '#eff6ff',
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
const LOGO_IMG = '<img src="https://phrames.cleffon.com/logos/Logo-white.svg" alt="Phrames" width="130" height="31" style="display:block;border:0;outline:none;" />'

// ─── Base layout ──────────────────────────────────────────────────────────────
interface BaseOpts { accent?: string; tag?: string; tagColor?: string; tagBg?: string }

function base(content: string, opts: BaseOpts = {}): string {
  const accent   = opts.accent   ?? C.accent
  const tag      = opts.tag      ?? 'Notification'
  const tagColor = opts.tagColor ?? C.primary
  const tagBg    = opts.tagBg    ?? C.accent
  const year     = new Date().getFullYear()

  return (
    '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
    '<meta charset="UTF-8"/>' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"/>' +
    '<meta name="color-scheme" content="light"/>' +
    '</head>' +
    '<body style="margin:0;padding:0;background:' + C.bg + ';font-family:\'Mona Sans\',-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' + C.bg + ';min-height:100vh;">' +
    '<tr><td align="center" style="padding:40px 16px 56px;">' +
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">' +

    // Header
    '<tr><td style="background:' + C.primary + ';border-radius:16px 16px 0 0;padding:24px 32px 22px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
    '<td style="vertical-align:middle;">' + LOGO_IMG + '</td>' +
    '<td align="right" style="vertical-align:middle;">' +
    '<span style="display:inline-block;background:' + tagBg + ';color:' + tagColor + ';font-size:11px;font-weight:700;letter-spacing:0.6px;padding:5px 12px;border-radius:100px;text-transform:uppercase;white-space:nowrap;">' + tag + '</span>' +
    '</td></tr></table>' +
    '</td></tr>' +

    // Accent line
    '<tr><td style="background:' + accent + ';height:2px;line-height:2px;font-size:0;">&nbsp;</td></tr>' +

    // Body
    '<tr><td style="background:' + C.white + ';padding:40px 32px 32px;border-left:1px solid ' + C.border + ';border-right:1px solid ' + C.border + ';">' +
    content +
    '</td></tr>' +

    // Footer
    '<tr><td style="background:' + C.muted + ';border-radius:0 0 16px 16px;padding:20px 32px;border:1px solid ' + C.border + ';border-top:none;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
    '<td style="color:' + C.textLight + ';font-size:12px;line-height:1.5;">' +
    '&copy; ' + year + ' Phrames &nbsp;&middot;&nbsp; ' +
    '<a href="' + APP_URL + '" style="color:' + C.textLight + ';text-decoration:none;">phrames.cleffon.com</a>' +
    '</td>' +
    '<td align="right" style="color:' + C.textLight + ';font-size:12px;">' +
    '<a href="mailto:support@cleffon.com" style="color:' + C.textLight + ';text-decoration:none;">support@cleffon.com</a>' +
    '</td>' +
    '</tr></table>' +
    '</td></tr>' +

    '</table></td></tr></table>' +
    '</body></html>'
  )
}

// ─── Components ───────────────────────────────────────────────────────────────

function btn(label: string, url: string): string {
  return (
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;"><tr>' +
    '<td style="border-radius:10px;background:' + C.primary + ';">' +
    '<a href="' + url + '" style="display:inline-block;padding:14px 32px;color:' + C.white + ';font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.1px;border-radius:10px;white-space:nowrap;">' + label + '</a>' +
    '</td></tr></table>'
  )
}

function badge(label: string, color: string, bg: string): string {
  return (
    '<div style="display:inline-block;background:' + bg + ';border-radius:100px;padding:5px 14px;margin-bottom:20px;">' +
    '<span style="color:' + color + ';font-size:12px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;">' + label + '</span>' +
    '</div>'
  )
}

function heading(text: string): string {
  return '<h1 style="margin:0 0 12px;color:' + C.primary + ';font-size:26px;font-weight:800;line-height:1.25;letter-spacing:-0.5px;">' + text + '</h1>'
}

function bodyText(text: string): string {
  return '<p style="margin:0 0 4px;color:' + C.textMuted + ';font-size:15px;line-height:1.7;">' + text + '</p>'
}

function infoCard(rows: Array<[string, string]>): string {
  const rowsHtml = rows.map(function(row, i) {
    const label   = row[0]
    const value   = row[1]
    const isLast  = i === rows.length - 1
    const border  = isLast ? '' : 'border-bottom:1px solid ' + C.border + ';'
    return (
      '<tr>' +
      '<td style="padding:11px 0;color:' + C.textLight + ';font-size:13px;font-weight:500;' + border + '">' + label + '</td>' +
      '<td style="padding:11px 0;color:' + C.primary + ';font-size:13px;font-weight:700;text-align:right;' + border + '">' + value + '</td>' +
      '</tr>'
    )
  }).join('')
  return (
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
    'style="background:' + C.muted + ';border:1px solid ' + C.border + ';border-radius:12px;padding:0 16px;margin-top:24px;">' +
    rowsHtml +
    '</table>'
  )
}

function callout(text: string, borderColor?: string): string {
  const bc = borderColor ?? C.accent
  return (
    '<div style="background:' + C.muted + ';border-left:3px solid ' + bc + ';border-radius:0 8px 8px 0;padding:14px 16px;margin-top:20px;color:' + C.textMuted + ';font-size:14px;line-height:1.6;">' +
    text +
    '</div>'
  )
}

// ─── Email senders ────────────────────────────────────────────────────────────

export function sendPaymentConfirmationEmail(to: string, data: {
  userName: string
  campaignName: string
  planName: string
  amount: number
  invoiceNumber: string
  orderId: string
}): Promise<unknown> {
  const rows: Array<[string, string]> = [
    ['Campaign',    data.campaignName],
    ['Plan',        data.planName],
    ['Amount Paid', '\u20B9' + data.amount],
    ['Invoice #',   data.invoiceNumber],
    ['Order ID',    data.orderId],
  ]
  const content = (
    badge('Payment Confirmed', '#166534', '#dcfce7') +
    heading('Your campaign is live') +
    bodyText('Hi ' + data.userName + ', your payment was successful and your campaign is now active and visible to the public.') +
    infoCard(rows) +
    btn('Go to Dashboard', APP_URL + '/dashboard')
  )
  const html = base(content, { tag: 'Payment', tagBg: '#dcfce7', tagColor: '#166534', accent: C.accent })
  return sendEmail(to, '\u2713 Payment confirmed \u2013 your campaign is live', html)
}

export function sendSupportTicketEmail(to: string, data: {
  name: string
  ticketId: string
  subject: string
}): Promise<unknown> {
  const rows: Array<[string, string]> = [
    ['Ticket ID', data.ticketId],
    ['Subject',   data.subject],
    ['Status',    'Open'],
  ]
  const content = (
    badge('Support Ticket', C.blue, C.blueBg) +
    heading('We got your message') +
    bodyText('Hi ' + data.name + ', your support ticket has been submitted. Our team will get back to you as soon as possible.') +
    infoCard(rows) +
    btn('View My Tickets', APP_URL + '/dashboard/support')
  )
  const html = base(content, { tag: 'Support', tagBg: C.blueBg, tagColor: C.blue, accent: C.blue })
  return sendEmail(to, 'Support ticket received \u2013 ' + data.ticketId, html)
}

export function sendCampaignStatusEmail(to: string, data: {
  userName: string
  campaignName: string
  status: 'reactivated' | 'deactivated'
  reason?: string
}): Promise<unknown> {
  const isActive   = data.status === 'reactivated'
  const accent     = isActive ? C.accent : '#f87171'
  const badgeLabel = isActive ? 'Campaign Activated' : 'Campaign Deactivated'
  const badgeColor = isActive ? '#166534' : C.red
  const badgeBg    = isActive ? '#dcfce7' : C.redBg
  const headText   = isActive ? 'Your campaign is now live' : 'Your campaign was deactivated'
  const statusText = isActive ? 'activated and is now visible to the public' : 'deactivated'
  const content = (
    badge(badgeLabel, badgeColor, badgeBg) +
    heading(headText) +
    bodyText('Hi ' + data.userName + ', your campaign <strong style="color:' + C.primary + ';">' + data.campaignName + '</strong> has been ' + statusText + '.') +
    (data.reason ? callout('<strong>Reason:</strong> ' + data.reason, accent) : '') +
    btn('View Dashboard', APP_URL + '/dashboard')
  )
  const html = base(content, { tag: isActive ? 'Activated' : 'Deactivated', tagBg: badgeBg, tagColor: badgeColor, accent })
  return sendEmail(to, 'Your campaign has been ' + (isActive ? 'activated' : 'deactivated'), html)
}

export function sendCampaignExpiryWarningEmail(to: string, data: {
  userName: string
  campaignName: string
  campaignSlug: string
  daysLeft: number
  expiresAt: string
}): Promise<unknown> {
  const isUrgent   = data.daysLeft <= 1
  const accent     = isUrgent ? '#f97316' : C.amber
  const badgeLabel = isUrgent ? 'Expires Tomorrow' : 'Expires in ' + data.daysLeft + ' Days'
  const badgeColor = isUrgent ? '#9a3412' : '#92400e'
  const badgeBg    = isUrgent ? '#fff7ed' : C.amberBg
  const headText   = isUrgent ? 'Your campaign expires tomorrow' : 'Your campaign expires in ' + data.daysLeft + ' days'
  const daysLabel  = data.daysLeft + (data.daysLeft !== 1 ? ' days' : ' day')
  const rows: Array<[string, string]> = [
    ['Campaign',       data.campaignName],
    ['Expiry Date',    data.expiresAt],
    ['Days Remaining', daysLabel],
  ]
  const content = (
    badge(badgeLabel, badgeColor, badgeBg) +
    heading(headText) +
    bodyText('Hi ' + data.userName + ', your campaign <strong style="color:' + C.primary + ';">' + data.campaignName + '</strong> will expire on <strong>' + data.expiresAt + '</strong>. Renew now to keep it live and continue collecting supporters.') +
    infoCard(rows) +
    btn('Renew Campaign', APP_URL + '/campaign/' + data.campaignSlug)
  )
  const html = base(content, { tag: isUrgent ? 'Urgent' : 'Reminder', tagBg: badgeBg, tagColor: badgeColor, accent })
  const emoji   = isUrgent ? '\uD83D\uDEA8' : '\u23F0'
  const expText = isUrgent ? 'tomorrow' : 'in ' + data.daysLeft + ' days'
  return sendEmail(to, emoji + ' Your campaign "' + data.campaignName + '" expires ' + expText, html)
}

export function sendCampaignExpiredEmail(to: string, data: {
  userName: string
  campaignName: string
  campaignSlug: string
}): Promise<unknown> {
  const content = (
    badge('Campaign Expired', C.red, C.redBg) +
    heading('Your campaign has expired') +
    bodyText('Hi ' + data.userName + ', your campaign <strong style="color:' + C.primary + ';">' + data.campaignName + '</strong> has expired and is no longer visible to the public.') +
    callout('Your campaign data is safe. Renewing will restore it immediately.', C.accent) +
    btn('Renew Campaign', APP_URL + '/campaign/' + data.campaignSlug)
  )
  const html = base(content, { tag: 'Expired', tagBg: C.redBg, tagColor: C.red, accent: '#f87171' })
  return sendEmail(to, 'Your campaign "' + data.campaignName + '" has expired', html)
}

export function sendPasswordResetConfirmationEmail(to: string, data: {
  userName: string
}): Promise<unknown> {
  const content = (
    badge('Password Reset', C.blue, C.blueBg) +
    heading('Password reset email sent') +
    bodyText('Hi ' + data.userName + ', we received a request to reset your Phrames password. Check your inbox for the reset link \u2014 it expires in 1 hour.') +
    callout('If you did not request this, you can safely ignore this email. Your account remains secure.') +
    btn('Go to Login', APP_URL + '/login')
  )
  const html = base(content, { tag: 'Security', tagBg: C.blueBg, tagColor: C.blue, accent: C.blue })
  return sendEmail(to, 'Password reset requested \u2013 Phrames', html)
}
