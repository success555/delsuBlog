import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project')
);

export const isSupabaseAdminConfigured: boolean = Boolean(
  isSupabaseConfigured &&
    supabaseServiceRoleKey &&
    !supabaseServiceRoleKey.includes('placeholder')
);

// Public client (for client-side or anon read operations)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin client (server-side only with service_role key to bypass RLS for webhooks & admin CMS)
export const supabaseAdmin: SupabaseClient | null = isSupabaseAdminConfigured
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Uploads a file buffer or Blob to a specified Supabase Storage bucket.
 * Returns the public URL of the uploaded asset, or null if Supabase is not configured.
 */
export async function uploadToSupabaseStorage(
  bucketName: 'post-covers' | 'staff-avatars' | 'media-uploads',
  filePath: string,
  fileBody: Buffer | Uint8Array | Blob,
  contentType?: string
): Promise<{ url: string | null; error: Error | null }> {
  const client = supabaseAdmin || supabase;
  if (!client) {
    return { url: null, error: new Error('Supabase is not configured.') };
  }

  try {
    const { data, error } = await client.storage
      .from(bucketName)
      .upload(filePath, fileBody, {
        contentType,
        upsert: true,
        cacheControl: '3600',
      });

    if (error) {
      return { url: null, error };
    }

    const { data: publicUrlData } = client.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err };
  }
}
