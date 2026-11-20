import { Post, CategoryInfo } from '@/types/blog';
import { Advertisement } from '@/types/ads';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import fs from 'fs/promises';
import path from 'path';

const postsFilePath = path.join(process.cwd(), 'src', 'data', 'posts.json');
const categoriesFilePath = path.join(process.cwd(), 'src', 'data', 'categories.json');
const adsFilePath = path.join(process.cwd(), 'src', 'data', 'ads.json');

// Helper to get active server-side Supabase client (service role preferred)
function getDbClient() {
  return supabaseAdmin || supabase;
}

// ==========================================
// POSTS
// ==========================================
export async function getServerPosts(): Promise<Post[]> {
  const client = getDbClient();

  // 1. Supabase Postgres Primary
  if (client) {
    try {
      const { data, error } = await client
        .from('posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row: any) => ({
          ...row,
          category: row.category || row.category_slug || 'campus-updates',
        })) as Post[];
      }
    } catch (err) {
      console.warn('Supabase getServerPosts failed, falling back to local file:', err);
    }
  }

  // 2. Offline / Serverless Fallback
  try {
    const raw = await fs.readFile(postsFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Could not read posts.json fallback:', err);
    return [];
  }
}

export async function saveServerPosts(posts: Post[]): Promise<void> {
  const client = getDbClient();

  // 1. Supabase Postgres Primary
  if (client && posts.length > 0) {
    try {
      const dbPayload = posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        category: p.category,
        category_slug: p.category,
        cover_image: p.cover_image,
        author_name: p.author_name,
        author_avatar: p.author_avatar,
        author_role: p.author_role,
        reading_time: p.reading_time,
        is_featured: Boolean(p.is_featured),
        is_sponsored: Boolean(p.is_sponsored),
        is_trending: Boolean(p.is_trending),
        views_count: p.views_count || 0,
        published_at: p.published_at || new Date().toISOString(),
        created_at: p.created_at || new Date().toISOString(),
        status: p.status || 'published',
      }));

      const { error } = await client.from('posts').upsert(dbPayload, { onConflict: 'slug' });
      if (error) {
        console.warn('Supabase saveServerPosts upsert error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase saveServerPosts failed:', err);
    }
  }

  // 2. Local File System (safely ignored on read-only serverless runtimes)
  try {
    await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf-8');
  } catch {
    // Read-only serverless environment (e.g. Vercel) - safely ignore
  }
}

// ==========================================
// CATEGORIES
// ==========================================
export async function getServerCategories(): Promise<CategoryInfo[]> {
  const client = getDbClient();

  // 1. Supabase Postgres Primary
  if (client) {
    try {
      const { data, error } = await client
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          slug: row.slug,
          name: row.name,
          shortName: row.short_name || row.shortName || row.name,
          description: row.description || '',
          accentColor: row.accent_color || row.accentColor || 'bg-red-600 text-white',
          created_at: row.created_at,
          is_default: row.is_default,
        })) as CategoryInfo[];
      }
    } catch (err) {
      console.warn('Supabase getServerCategories failed, falling back to local file:', err);
    }
  }

  // 2. Offline / Serverless Fallback
  try {
    const raw = await fs.readFile(categoriesFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Could not read categories.json fallback:', err);
    return [];
  }
}

export async function saveServerCategories(cats: CategoryInfo[]): Promise<void> {
  const client = getDbClient();

  // 1. Supabase Postgres Primary
  if (client && cats.length > 0) {
    try {
      const dbPayload = cats.map((c, idx) => ({
        id: c.id || `cat-${idx + 1}`,
        slug: c.slug,
        name: c.name,
        short_name: c.shortName || c.name,
        description: c.description || '',
        accent_color: c.accentColor || 'bg-red-600 text-white',
        display_order: idx,
        is_active: true,
        created_at: c.created_at || new Date().toISOString(),
      }));

      const { error } = await client.from('categories').upsert(dbPayload, { onConflict: 'slug' });
      if (error) {
        console.warn('Supabase saveServerCategories upsert error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase saveServerCategories failed:', err);
    }
  }

  // 2. Local File System
  try {
    await fs.writeFile(categoriesFilePath, JSON.stringify(cats, null, 2), 'utf-8');
  } catch {
    // Read-only serverless environment - safely ignore
  }
}

// ==========================================
// ADVERTISEMENTS
// ==========================================
export async function getServerAds(): Promise<Advertisement[]> {
  const client = getDbClient();

  // 1. Supabase Postgres Primary
  if (client) {
    try {
      const { data, error } = await client
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data as Advertisement[];
      }
    } catch (err) {
      console.warn('Supabase getServerAds failed, falling back to local file:', err);
    }
  }

  // 2. Offline / Serverless Fallback
  try {
    const raw = await fs.readFile(adsFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Could not read ads.json fallback:', err);
    return [];
  }
}

export async function saveServerAds(ads: Advertisement[]): Promise<void> {
  const client = getDbClient();

  // 1. Supabase Postgres Primary
  if (client && ads.length > 0) {
    try {
      const dbPayload = ads.map((a) => ({
        id: a.id || `ad-${a.slot}`,
        slot: a.slot,
        title: a.title,
        image_url: a.image_url || '',
        target_url: a.target_url || 'https://wa.me/message/J3ZOIRSKCSMZM1',
        sponsor_name: a.sponsor_name || 'DELSU Ad Partner',
        is_active: Boolean(a.is_active),
        clicks_count: a.clicks_count || 0,
        updated_at: a.updated_at || new Date().toISOString(),
      }));

      const { error } = await client.from('advertisements').upsert(dbPayload, { onConflict: 'slot' });
      if (error) {
        console.warn('Supabase saveServerAds upsert error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase saveServerAds failed:', err);
    }
  }

  // 2. Local File System
  try {
    await fs.writeFile(adsFilePath, JSON.stringify(ads, null, 2), 'utf-8');
  } catch {
    // Read-only serverless environment - safely ignore
  }
}
