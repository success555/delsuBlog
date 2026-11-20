import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!WEBHOOK_SECRET || WEBHOOK_SECRET.includes('placeholder')) {
    console.error('CLERK_WEBHOOK_SIGNING_SECRET is not configured.');
    return new NextResponse('Webhook secret missing', { status: 500 });
  }

  // Get the Svix headers for signature verification
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error: Missing Svix verification headers', {
      status: 400,
    });
  }

  // Get the raw payload body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as unknown as WebhookEvent;
  } catch (err: any) {
    console.error('Error verifying Clerk webhook signature:', err.message);
    return new NextResponse('Error: Invalid webhook signature', { status: 400 });
  }

  const eventType = evt.type;

  // Process User Events
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, username, image_url, public_metadata } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address;

    if (!primaryEmail) {
      return NextResponse.json({ message: 'User skipped: No email found' }, { status: 200 });
    }

    if (isSupabaseAdminConfigured && supabaseAdmin) {
      try {
        const { error } = await supabaseAdmin.from('profiles').upsert(
          {
            id, // Clerk User ID (user_*)
            email: primaryEmail,
            first_name: first_name || null,
            last_name: last_name || null,
            username: username || null,
            avatar_url: image_url || null,
            role: (public_metadata?.role as string) || 'reader',
            title_or_role: (public_metadata?.title as string) || 'DELSU Campus Correspondent',
            accreditation: (public_metadata?.accreditation as string) || 'DELSU Press Council Accredited',
            is_verified: Boolean(public_metadata?.is_verified),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

        if (error) {
          console.error('Supabase profile upsert error:', error);
          return new NextResponse('Error syncing user with Supabase', { status: 500 });
        }
      } catch (dbErr) {
        console.error('Database connection error during Clerk sync:', dbErr);
        return new NextResponse('Database connection error', { status: 500 });
      }
    } else {
      console.log(
        `[Clerk Webhook Received] User ${id} (${primaryEmail}) synced in local fallback mode.`
      );
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    if (id && isSupabaseAdminConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('profiles').delete().eq('id', id);
      } catch (delErr) {
        console.error('Error deleting user profile from Supabase:', delErr);
      }
    }
  }

  return NextResponse.json({ success: true, event: eventType });
}
