/**
 * Email Service using Resend
 * Handles all transactional email delivery
 */

import { Resend } from 'resend';
import { logger } from '@/lib/logger';

// Lazy initialization - only create client when needed
let resendClient: Resend | null = null;

function getClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'noreply@viralfluencer.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Viralfluencer';
const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export async function sendEmail(options: SendEmailOptions): Promise<{ id: string } | null> {
  try {
    const resend = getClient();
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_ADDRESS}>`,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
      tags: options.tags,
    });

    if (error) {
      logger.error('Failed to send email', { error, to: options.to, subject: options.subject });
      return null;
    }

    logger.info('Email sent successfully', { id: data?.id, to: options.to });
    return data;
  } catch (error) {
    logger.error('Email service error', { error, to: options.to });
    return null;
  }
}

// ─── Email Templates ────────────────────────────────────────────────────────

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .logo { font-size: 24px; font-weight: 700; color: #d4a843; text-align: center; margin-bottom: 32px; }
    .heading { font-size: 20px; font-weight: 600; color: #18181b; margin-bottom: 16px; }
    .text { font-size: 16px; line-height: 1.6; color: #3f3f46; margin-bottom: 16px; }
    .btn { display: inline-block; padding: 12px 32px; background-color: #d4a843; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .footer { text-align: center; font-size: 13px; color: #a1a1aa; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e4e4e7; }
    .muted { font-size: 13px; color: #71717a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">Viralfluencer</div>
      ${content}
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Viralfluencer. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
  return sendEmail({
    to: email,
    subject: 'Verify your email address',
    html: baseLayout(`
      <h2 class="heading">Welcome, ${name}!</h2>
      <p class="text">Thanks for signing up for Viralfluencer. Please verify your email address to get started.</p>
      <div class="btn-container">
        <a href="${verifyUrl}" class="btn">Verify Email</a>
      </div>
      <p class="muted">If you didn't create this account, you can safely ignore this email.</p>
      <p class="muted">Link expires in 24 hours. If the button doesn't work, copy this URL:<br>${verifyUrl}</p>
    `),
    tags: [{ name: 'type', value: 'verification' }],
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: 'Reset your password',
    html: baseLayout(`
      <h2 class="heading">Password Reset</h2>
      <p class="text">Hi ${name}, we received a request to reset your password.</p>
      <div class="btn-container">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </div>
      <p class="muted">This link expires in 1 hour. If you didn't request this, you can safely ignore it.</p>
      <p class="muted">If the button doesn't work, copy this URL:<br>${resetUrl}</p>
    `),
    tags: [{ name: 'type', value: 'password-reset' }],
  });
}

export async function sendCollaborationInviteEmail(
  email: string,
  influencerName: string,
  brandName: string,
  campaignTitle: string,
  collaborationId: string
) {
  const viewUrl = `${APP_URL}/influencer/campaigns/${collaborationId}`;
  return sendEmail({
    to: email,
    subject: `New collaboration invite from ${brandName}`,
    html: baseLayout(`
      <h2 class="heading">New Collaboration Invite</h2>
      <p class="text">Hi ${influencerName},</p>
      <p class="text"><strong>${brandName}</strong> would like to collaborate with you on <strong>${campaignTitle}</strong>.</p>
      <div class="btn-container">
        <a href="${viewUrl}" class="btn">View Details</a>
      </div>
      <p class="muted">Log in to your dashboard to accept, negotiate, or decline this invitation.</p>
    `),
    tags: [{ name: 'type', value: 'collaboration-invite' }],
  });
}

export async function sendPaymentReceivedEmail(
  email: string,
  name: string,
  amount: number,
  currency: string,
  description: string
) {
  return sendEmail({
    to: email,
    subject: `Payment received: ${currency} ${amount.toFixed(2)}`,
    html: baseLayout(`
      <h2 class="heading">Payment Received</h2>
      <p class="text">Hi ${name},</p>
      <p class="text">You've received a payment of <strong>${currency} ${amount.toFixed(2)}</strong> for ${description}.</p>
      <div class="btn-container">
        <a href="${APP_URL}/influencer/payments" class="btn">View Payments</a>
      </div>
    `),
    tags: [{ name: 'type', value: 'payment-received' }],
  });
}

export async function sendInvoiceEmail(
  email: string,
  name: string,
  invoiceNumber: string,
  amount: number,
  currency: string,
  dueDate: string
) {
  return sendEmail({
    to: email,
    subject: `Invoice ${invoiceNumber} - ${currency} ${amount.toFixed(2)}`,
    html: baseLayout(`
      <h2 class="heading">New Invoice</h2>
      <p class="text">Hi ${name},</p>
      <p class="text">You have a new invoice:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td class="text" style="padding:8px 0;"><strong>Invoice #:</strong></td><td class="text">${invoiceNumber}</td></tr>
        <tr><td class="text" style="padding:8px 0;"><strong>Amount:</strong></td><td class="text">${currency} ${amount.toFixed(2)}</td></tr>
        <tr><td class="text" style="padding:8px 0;"><strong>Due Date:</strong></td><td class="text">${dueDate}</td></tr>
      </table>
      <div class="btn-container">
        <a href="${APP_URL}/brand/wallet" class="btn">Pay Now</a>
      </div>
    `),
    tags: [{ name: 'type', value: 'invoice' }],
  });
}
