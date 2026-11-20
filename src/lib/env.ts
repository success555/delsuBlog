/**
 * Environment Variables Configuration & Feature Detection
 * Provides type-safe access to environment variables with fallback detection.
 */

export const env = {
  // Application
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'DELSU Abraka Update Blog TV',
  adminPassword: process.env.ADMIN_PASSWORD || 'delsu2026',

  // Clerk Authentication
  clerk: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    secretKey: process.env.CLERK_SECRET_KEY || '',
    webhookSecret: process.env.CLERK_WEBHOOK_SIGNING_SECRET || '',
    isConfigured: Boolean(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder') &&
      process.env.CLERK_SECRET_KEY &&
      !process.env.CLERK_SECRET_KEY.includes('placeholder')
    ),
  },

  // Supabase Database & Storage
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    buckets: {
      covers: process.env.SUPABASE_STORAGE_BUCKET_COVERS || 'post-covers',
      avatars: process.env.SUPABASE_STORAGE_BUCKET_AVATARS || 'staff-avatars',
      media: process.env.SUPABASE_STORAGE_BUCKET_MEDIA || 'media-uploads',
    },
    isConfigured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project') &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder')
    ),
  },

  // Resend Email Engine
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.RESEND_FROM_EMAIL || 'DELSU Abraka Blog <onboarding@resend.dev>',
    editorialEmail: process.env.EDITORIAL_NOTIFICATION_EMAIL || 'editor@delsublog.ng',
    audienceId: process.env.RESEND_AUDIENCE_ID || '',
    isConfigured: Boolean(
      process.env.RESEND_API_KEY &&
      !process.env.RESEND_API_KEY.includes('placeholder')
    ),
  },
};
