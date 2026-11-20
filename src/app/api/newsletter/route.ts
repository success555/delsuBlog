import { NextResponse } from 'next/server';
import { resend, isResendConfigured, sendWelcomeNewsletterEmail } from '@/lib/resend';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, source = 'homepage_banner' } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    let resendContactId: string | undefined;

    // 1. Sync with Resend Audience / Contacts if configured
    if (isResendConfigured && resend) {
      try {
        const audienceId = process.env.RESEND_AUDIENCE_ID;
        if (audienceId) {
          const { data: contact } = await resend.contacts.create({
            email: cleanEmail,
            firstName: name?.trim() || undefined,
            audienceId,
            unsubscribed: false,
          });
          resendContactId = contact?.id;
        }
      } catch (err) {
        console.warn('Resend contact create warning:', err);
      }
    }

    // 2. Persist in Supabase Postgres if configured
    if (isSupabaseAdminConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('newsletter_subscribers').upsert(
          {
            email: cleanEmail,
            first_name: name?.trim() || null,
            resend_contact_id: resendContactId || null,
            source,
            status: 'active',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        );
      } catch (err) {
        console.warn('Supabase subscriber insert warning:', err);
      }
    }

    // 3. Dispatch Welcome Email via Resend
    await sendWelcomeNewsletterEmail({
      email: cleanEmail,
      name: name?.trim(),
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing to DELSU Abraka Blog TV!',
      resendSynced: Boolean(resendContactId),
    });
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process subscription' },
      { status: 500 }
    );
  }
}

