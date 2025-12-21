import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

export interface EmailTemplate {
  subject: string
  htmlBody: string
  textBody: string
}

export interface CampaignReminderData {
  campaignName: string
  campaignSlug: string
  daysUntilDeletion: number
  userEmail: string
  userName?: string
}

/**
 * Generate email templates for campaign deletion reminders
 */
export function generateCampaignReminderEmail(data: CampaignReminderData): EmailTemplate {
  const { campaignName, campaignSlug, daysUntilDeletion, userName } = data
  const greeting = userName ? `Hi ${userName}` : 'Hello'
  const campaignUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://phrames.com'}/campaign/${campaignSlug}`
  
  const subject = daysUntilDeletion === 0 
    ? `Your campaign "${campaignName}" has been deleted due to inactivity`
    : `Reminder: Your campaign "${campaignName}" will be deleted in ${daysUntilDeletion} days`

  const htmlBody = daysUntilDeletion === 0 
    ? generateDeletionNotificationHtml(greeting, campaignName, campaignUrl)
    : generateReminderHtml(greeting, campaignName, campaignUrl, daysUntilDeletion)

  const textBody = daysUntilDeletion === 0
    ? generateDeletionNotificationText(greeting, campaignName, campaignUrl)
    : generateReminderText(greeting, campaignName, campaignUrl, daysUntilDeletion)

  return { subject, htmlBody, textBody }
}

function generateReminderHtml(greeting: string, campaignName: string, campaignUrl: string, daysUntilDeletion: number): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Campaign Deletion Reminder</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Phrames</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0;">Campaign Reminder</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 20px;">${greeting},</p>
        
        <p>We noticed that your campaign <strong>"${campaignName}"</strong> has been inactive for a while.</p>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">⚠️ Important Notice</h3>
          <p style="color: #856404; margin-bottom: 0;">
            Your campaign will be <strong>automatically deleted in ${daysUntilDeletion} days</strong> due to inactivity. 
            This is part of our policy to keep campaigns active and engaging.
          </p>
        </div>
        
        <p>To keep your campaign active and prevent deletion:</p>
        <ul>
          <li>Visit your campaign page</li>
          <li>Share it with your audience</li>
          <li>Update the content or description</li>
          <li>Engage with your supporters</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${campaignUrl}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold; 
                    display: inline-block;">
            View Your Campaign
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          If you no longer need this campaign, you can safely ignore this email and it will be automatically deleted.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated message from Phrames. If you have any questions, please contact our support team.
        </p>
      </div>
    </body>
    </html>
  `
}

function generateReminderText(greeting: string, campaignName: string, campaignUrl: string, daysUntilDeletion: number): string {
  return `
${greeting},

We noticed that your campaign "${campaignName}" has been inactive for a while.

IMPORTANT NOTICE:
Your campaign will be automatically deleted in ${daysUntilDeletion} days due to inactivity. This is part of our policy to keep campaigns active and engaging.

To keep your campaign active and prevent deletion:
- Visit your campaign page
- Share it with your audience  
- Update the content or description
- Engage with your supporters

View your campaign: ${campaignUrl}

If you no longer need this campaign, you can safely ignore this email and it will be automatically deleted.

---
This is an automated message from Phrames. If you have any questions, please contact our support team.
  `.trim()
}

function generateDeletionNotificationHtml(greeting: string, campaignName: string, campaignUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Campaign Deleted</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Phrames</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0;">Campaign Notification</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 20px;">${greeting},</p>
        
        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #721c24; margin-top: 0;">Campaign Deleted</h3>
          <p style="color: #721c24; margin-bottom: 0;">
            Your campaign <strong>"${campaignName}"</strong> has been automatically deleted due to 30 days of inactivity.
          </p>
        </div>
        
        <p>This action was taken as part of our policy to maintain an active and engaging platform. Inactive campaigns are automatically removed to ensure the best experience for all users.</p>
        
        <p><strong>What this means:</strong></p>
        <ul>
          <li>Your campaign is no longer accessible</li>
          <li>All campaign data has been permanently removed</li>
          <li>The campaign URL is now available for others to use</li>
        </ul>
        
        <p>You can always create a new campaign anytime by visiting our platform.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://phrames.com'}/create" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold; 
                    display: inline-block;">
            Create New Campaign
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated message from Phrames. If you have any questions, please contact our support team.
        </p>
      </div>
    </body>
    </html>
  `
}

function generateDeletionNotificationText(greeting: string, campaignName: string, campaignUrl: string): string {
  return `
${greeting},

Your campaign "${campaignName}" has been automatically deleted due to 30 days of inactivity.

This action was taken as part of our policy to maintain an active and engaging platform. Inactive campaigns are automatically removed to ensure the best experience for all users.

What this means:
- Your campaign is no longer accessible
- All campaign data has been permanently removed  
- The campaign URL is now available for others to use

You can always create a new campaign anytime by visiting our platform: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://phrames.com'}/create

---
This is an automated message from Phrames. If you have any questions, please contact our support team.
  `.trim()
}

/**
 * Log email sending attempt (placeholder for actual email service integration)
 */
export async function logEmailSent(
  userId: string, 
  email: string, 
  type: 'reminder' | 'deletion_notice',
  campaignId: string,
  daysUntilDeletion?: number
): Promise<void> {
  try {
    await db.collection('emailLogs').add({
      userId,
      email,
      type,
      campaignId,
      daysUntilDeletion: daysUntilDeletion || 0,
      sentAt: Timestamp.now(),
      status: 'logged' // In real implementation, this would be 'sent', 'failed', etc.
    })
  } catch (error) {
    console.error('Failed to log email:', error)
  }
}

/**
 * Send email using Resend (free forever: 3,000 emails/month)
 * Alternative implementations for other services are in the documentation
 */
export async function sendEmail(
  to: string,
  template: EmailTemplate
): Promise<{ success: boolean; error?: string }> {
  // Check if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    console.log('📧 RESEND_API_KEY not configured. Email would be sent to:', to)
    console.log('📧 Subject:', template.subject)
    console.log('📧 To enable emails, add RESEND_API_KEY to your .env.local file')
    return { success: true } // Return success to not break the flow
  }

  try {
    // Dynamic import to avoid errors if resend is not installed
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Phrames <noreply@phrames.com>',
      to: [to],
      subject: template.subject,
      text: template.textBody,
      html: template.htmlBody,
    })

    if (result.error) {
      console.error('📧 Resend error:', result.error)
      return { success: false, error: result.error.message }
    }

    console.log('📧 Email sent successfully to:', to, 'ID:', result.data?.id)
    return { success: true }
    
  } catch (error: any) {
    // If resend is not installed, fall back to logging
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('📧 Resend not installed. Email would be sent to:', to)
      console.log('📧 Subject:', template.subject)
      console.log('📧 To enable emails: npm install resend')
      return { success: true }
    }
    
    console.error('📧 Email sending failed:', error)
    return { success: false, error: error.message }
  }
}