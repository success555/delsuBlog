import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
export const isResendConfigured: boolean = Boolean(
  resendApiKey &&
    resendApiKey.startsWith('re_') &&
    !resendApiKey.includes('placeholder')
);

export const resend: Resend | null = isResendConfigured
  ? new Resend(resendApiKey)
  : null;

const DEFAULT_FROM =
  process.env.RESEND_FROM_EMAIL || 'DELSU Abraka Blog <onboarding@resend.dev>';
const EDITORIAL_INBOX =
  process.env.EDITORIAL_NOTIFICATION_EMAIL || 'editor@delsublog.ng';

/**
 * Dispatches a Welcome Email to new newsletter subscribers.
 */
export async function sendWelcomeNewsletterEmail(params: {
  email: string;
  name?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const { email, name } = params;
  const recipientName = name ? ` ${name}` : '';

  if (!isResendConfigured || !resend) {
    console.log(
      `[Resend Fallback Mode] Welcome email logged for ${email} (API key not set).`
    );
    return { success: true, id: `mock-resend-${Date.now()}` };
  }

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: email,
      subject: 'Welcome to DELSU Abraka Update Blog TV! 🔴',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111827; border: 1px solid #e5e7eb; border-radius: 12px;">
          <div style="border-bottom: 3px solid #dc2626; padding-bottom: 16px; margin-bottom: 20px;">
            <h1 style="color: #dc2626; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
              DELSU ABRAKA UPDATE BLOG TV
            </h1>
            <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">Delta State University • Abraka • Campus & National Media</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">Hello${recipientName},</p>
          <p style="font-size: 15px; line-height: 1.6; color: #374151;">
            Thank you for subscribing to <strong>DELSU Abraka Update Blog TV</strong>! You are now part of our fast-growing community of students, faculty, alumni, and campus followers.
          </p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 14px 18px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-weight: 600; color: #991b1b; font-size: 14px;">What you will receive:</p>
            <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #7f1d1d; line-height: 1.6;">
              <li>Instant alerts on DELSU Senate, SUG, and campus academic notices</li>
              <li>Trending Afrobeats, campus gist, and sports updates</li>
              <li>National affairs, tech startup spotlights, and student opportunities</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
               style="background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
              Browse Latest Stories
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;" />
          <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} DELSU Abraka Update Blog TV. Delta State University, Abraka, Nigeria.
          </p>
        </div>
      `,
    });

    return { success: true, id: data.data?.id };
  } catch (err: any) {
    console.error('Resend email delivery error:', err);
    return { success: false, error: err.message || 'Failed to dispatch email' };
  }
}

/**
 * Dispatches an Email Alert to the DELSU editorial desk when a new inquiry is submitted.
 */
export async function sendContactInquiryNotification(params: {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  phoneNumber?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const { fullName, email, subject, message, category, phoneNumber } = params;

  if (!isResendConfigured || !resend) {
    console.log(
      `[Resend Fallback Mode] Contact notification logged for inquiry from ${fullName} <${email}>.`
    );
    return { success: true, id: `mock-contact-${Date.now()}` };
  }

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: EDITORIAL_INBOX,
      replyTo: email,
      subject: `[DELSU Desk] New ${category.toUpperCase()} Inquiry: ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #dc2626; margin-top: 0;">New Desk Inquiry Received</h2>
          <p><strong>From:</strong> ${fullName} (&lt;${email}&gt;)</p>
          ${phoneNumber ? `<p><strong>Phone:</strong> ${phoneNumber}</p>` : ''}
          <p><strong>Category:</strong> <span style="background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${category}</span></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <div style="background: #f9fafb; padding: 16px; border-radius: 6px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
        </div>
      `,
    });

    return { success: true, id: data.data?.id };
  } catch (err: any) {
    console.error('Resend contact notification error:', err);
    return { success: false, error: err.message };
  }
}
