import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const emailData: any = {
      to: params.to,
      from: params.from,
      subject: params.subject,
    };
    
    if (params.text) emailData.text = params.text;
    if (params.html) emailData.html = params.html;
    
    console.log(`[EmailService] Attempting to send email to: ${params.to}`);
    console.log(`[EmailService] From: ${params.from}`);
    console.log(`[EmailService] Subject: ${params.subject}`);
    console.log(`[EmailService] SendGrid API Key configured: ${process.env.SENDGRID_API_KEY ? 'Yes' : 'No'}`);
    
    const response = await mailService.send(emailData);
    const messageId = response && response[0] && response[0].headers ? response[0].headers['x-message-id'] : 'unknown';
    
    console.log(`[EmailService] Email sent successfully to: ${params.to}`);
    console.log(`[EmailService] SendGrid Message ID: ${messageId}`);
    console.log(`[EmailService] Response status: ${response && response[0] ? response[0].statusCode : 'unknown'}`);
    
    // Log critical delivery information
    console.log(`[EmailService] ⚠️  IMPORTANT: SendGrid acceptance ≠ delivery. Check SendGrid dashboard for actual delivery status.`);
    console.log(`[EmailService] Monitor delivery at: https://app.sendgrid.com/email_activity`);
    
    return { success: true, messageId };
  } catch (error: any) {
    console.error('[EmailService] SendGrid email error:', error);
    console.error('[EmailService] Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.body || 'No response body'
    });
    
    return { 
      success: false, 
      error: error.message || 'Unknown SendGrid error'
    };
  }
}

export async function sendPasswordResetEmail(
  userEmail: string, 
  resetToken: string,
  userName: string
): Promise<boolean> {
  const resetUrl = `${process.env.REPLIT_DOMAIN || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset - Pickle+</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f97316;">Pickle+</h1>
        </div>
        
        <h2 style="color: #333;">Password Reset Request</h2>
        
        <p>Hello ${userName},</p>
        
        <p>You recently requested to reset your password for your Pickle+ account. Click the button below to reset it:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Reset Your Password
          </a>
        </div>
        
        <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        
        <p><strong>This link will expire in 24 hours for security reasons.</strong></p>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #666;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
        
        <p style="font-size: 12px; color: #666;">
          This email was sent from Pickle+ password reset system. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Password Reset Request

Hello ${userName},

You recently requested to reset your password for your Pickle+ account.

To reset your password, click or copy this link into your browser:
${resetUrl}

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

This link will expire in 24 hours for security reasons.

---
This email was sent from Pickle+ password reset system. Please do not reply to this email.
  `;

  if (!process.env.SENDGRID_FROM_EMAIL) {
    console.error('[EmailService] SENDGRID_FROM_EMAIL environment variable not set');
    return false;
  }

  const result = await sendEmail({
    to: userEmail,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Reset Your Pickle+ Password',
    text: textContent,
    html: htmlContent
  });

  if (result.success) {
    console.log(`[EmailService] Password reset email queued for delivery. Message ID: ${result.messageId}`);
    console.log(`[EmailService] 🔍 Troubleshooting: If user doesn't receive email, check:`);
    console.log(`[EmailService] 1. SendGrid Email Activity: https://app.sendgrid.com/email_activity`);
    console.log(`[EmailService] 2. Search for recipient: ${userEmail}`);
    console.log(`[EmailService] 3. Check for bounces, blocks, or spam reports`);
    console.log(`[EmailService] 4. Verify domain authentication and SPF/DKIM records`);
  } else {
    console.error(`[EmailService] Failed to send password reset email: ${result.error}`);
  }

  return result.success;
}