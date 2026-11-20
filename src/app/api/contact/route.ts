import { NextResponse } from 'next/server';
import { sendContactInquiryNotification } from '@/lib/resend';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phoneNumber,
      subject,
      message,
      category = 'general',
    } = body;

    if (!fullName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      );
    }

    // 1. Persist to Supabase Postgres if configured
    if (isSupabaseAdminConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('contact_inquiries').insert({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone_number: phoneNumber?.trim() || null,
          category,
          subject: subject.trim(),
          message: message.trim(),
        });
      } catch (err) {
        console.warn('Supabase contact inquiry persist warning:', err);
      }
    }

    // 2. Dispatch Email Alert to Editorial Desk via Resend
    await sendContactInquiryNotification({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber?.trim(),
      subject: subject.trim(),
      message: message.trim(),
      category,
    });

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been received by the DELSU Abraka editorial desk!',
    });
  } catch (error: any) {
    console.error('Contact inquiry error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}

