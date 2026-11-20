# Environment Variables & Integration Guide

This directory contains environment templates and configuration documentation for **DELSU Abraka Blog (DELSU Abraka Update Blog TV)**.

## Integration Stack Overview

| Service | Primary Role in the App | Key Required Variables |
| :--- | :--- | :--- |
| **Clerk** | User authentication, staff roles, and profile management | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET` |
| **Supabase** | PostgreSQL database (articles, comments, subscribers) & Media Storage | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Resend** | Newsletter delivery, welcome emails, and contact form alerts | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `EDITORIAL_NOTIFICATION_EMAIL` |

---

## 1. Setting up Clerk (User Authentication)

1. Sign up / Log in to [Clerk Dashboard](https://dashboard.clerk.com).
2. Create a new application named **DELSU Abraka Blog**.
3. Choose your authentication methods (Email, Google, Password).
4. Navigate to **API Keys** in the left sidebar:
   - Copy **Publishable key** -> `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_...` or `pk_live_...`).
   - Copy **Secret key** -> `CLERK_SECRET_KEY` (starts with `sk_test_...` or `sk_live_...`).
5. **Set up Clerk Webhook to sync with Supabase `profiles`:**
   - In Clerk Dashboard, go to **Webhooks** -> **Add Endpoint**.
   - Endpoint URL: `https://your-domain.com/api/webhooks/clerk` (or your ngrok URL for local dev).
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`.
   - Copy the **Signing Secret** -> `CLERK_WEBHOOK_SIGNING_SECRET` (starts with `whsec_...`).

---

## 2. Setting up Supabase (PostgreSQL & Storage)

1. Sign up / Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project (e.g. `delsu-blog`).
3. Run the schema:
   - In Supabase, open **SQL Editor**.
   - Open [schema.sql](../schema.sql) from the root of this project, paste it into the SQL editor, and click **Run**.
4. Retrieve API credentials:
   - Go to **Project Settings** -> **API**.
   - Copy **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`.
   - Copy **`anon` `public` key** -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Copy **`service_role` `secret` key** -> `SUPABASE_SERVICE_ROLE_KEY`.
5. Verify Storage Buckets:
   - The SQL script automatically provisions 3 buckets: `post-covers`, `staff-avatars`, and `media-uploads` with public read permissions.

---

## 3. Setting up Resend (Email Engine)

1. Sign up / Log in to [Resend](https://resend.com).
2. Go to **API Keys** and click **Create API Key**.
   - Name: `delsu-blog-mailer`
   - Permission: Full Access
   - Copy the key -> `RESEND_API_KEY` (starts with `re_...`).
3. Sender Email:
   - For local development, Resend allows sending test emails from `DELSU Abraka Blog <onboarding@resend.dev>`.
   - In production, add and verify your custom domain (e.g. `delsublog.ng`) under **Domains** in Resend, then set `RESEND_FROM_EMAIL="DELSU Abraka Blog TV <updates@delsublog.ng>"`.

---

## 4. Local Development vs. Fallback Mode

If no keys are configured, the application **automatically runs in Local Offline Fallback Mode**:
- Articles & categories read from `/src/data/posts.json` and `/src/data/categories.json`.
- Uploaded images save to `/public/uploads/`.
- Once you add your live keys to `.env.local`, the application seamlessly switches to live Supabase, Clerk, and Resend without needing any code changes!

