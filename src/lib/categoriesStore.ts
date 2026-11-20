import { CategoryInfo } from '@/types/blog';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { slugify } from '@/lib/utils';

const LOCAL_STORAGE_CATEGORIES_KEY = 'delsu_blog_categories_v1';

function getDbClient() {
  if (typeof window === 'undefined') {
    return supabaseAdmin || supabase;
  }
  return supabase;
}

function getClientStoredCategories(): CategoryInfo[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function saveClientStoredCategories(cats: CategoryInfo[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(cats));
    window.dispatchEvent(new CustomEvent('delsu_categories_updated', { detail: cats }));
  } catch (err) {
    console.error('Failed to save categories to localStorage', err);
  }
}

export async function getAllCategories(): Promise<CategoryInfo[]> {
  const client = getDbClient();

  // 1. Supabase check
  if (client) {
    try {
      const { data, error } = await client
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

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
      console.warn('Supabase categories fetch failed:', err);
    }
  }

  // 2. Server check
  if (typeof window === 'undefined') {
    try {
      const { getServerCategories } = await import('@/lib/serverData');
      const serverCats = await getServerCategories();
      if (serverCats && serverCats.length > 0) return serverCats;
    } catch {
      // Fallback
    }
  }

  // 3. Client check
  const local = getClientStoredCategories();
  if (local) return local;

  // 4. Client fetch from API if empty
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          saveClientStoredCategories(data);
          return data;
        }
      }
    } catch {
      // Ignore
    }
  }

  return [];
}

export async function getCategoryBySlug(slug: string): Promise<CategoryInfo> {
  const cats = await getAllCategories();
  const found = cats.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
  if (found) return found;

  // Synthesize resilient fallback so category pages NEVER 404
  const formattedTitle = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    slug,
    name: formattedTitle,
    shortName: formattedTitle.slice(0, 16),
    description: `Latest articles, stories, news, and reports filed under ${formattedTitle}.`,
    accentColor: 'bg-red-600 text-white',
  };
}

export async function saveCategory(categoryData: Partial<CategoryInfo>): Promise<CategoryInfo> {
  // If in browser, delegate to API route
  if (typeof window !== 'undefined') {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save category');
    }

    const saved: CategoryInfo = await res.json();
    const current = getClientStoredCategories() || [];
    const updated = [...current.filter((c) => c.slug !== saved.slug), saved];
    saveClientStoredCategories(updated);
    return saved;
  }

  const slug = categoryData.slug
    ? slugify(categoryData.slug)
    : slugify(categoryData.name || 'category');

  const saved: CategoryInfo = {
    id: categoryData.id || `cat-${Date.now()}`,
    slug,
    name: categoryData.name || 'New Category',
    shortName: categoryData.shortName || categoryData.name || 'Category',
    description:
      categoryData.description ||
      `Latest articles and news filed under ${categoryData.name}.`,
    accentColor: categoryData.accentColor || 'bg-red-600 text-white',
    created_at: categoryData.created_at || new Date().toISOString(),
    is_default: Boolean(categoryData.is_default),
  };

  const client = getDbClient();
  if (client) {
    try {
      await client.from('categories').upsert({
        id: saved.id,
        slug: saved.slug,
        name: saved.name,
        short_name: saved.shortName,
        description: saved.description,
        accent_color: saved.accentColor,
        is_active: true,
      }, { onConflict: 'slug' });
    } catch (e) {
      console.warn('Supabase category upsert failed:', e);
    }
  }

  try {
    const { getServerCategories, saveServerCategories } = await import('@/lib/serverData');
    const existing = await getServerCategories();
    const updated = [...existing.filter((c) => c.slug !== saved.slug), saved];
    await saveServerCategories(updated);
  } catch (e) {
    console.warn('Failed to save categories on server:', e);
  }

  return saved;
}

export async function deleteCategory(slug: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    const res = await fetch(`/api/categories?slug=${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error('Failed to delete category');
    }
    const current = getClientStoredCategories() || [];
    saveClientStoredCategories(current.filter((c) => c.slug.toLowerCase() !== slug.toLowerCase()));
    return true;
  }

  const client = getDbClient();
  if (client) {
    try {
      await client.from('categories').delete().eq('slug', slug);
    } catch (e) {
      console.warn('Supabase category delete failed:', e);
    }
  }

  try {
    const { getServerCategories, saveServerCategories } = await import('@/lib/serverData');
    const existing = await getServerCategories();
    await saveServerCategories(existing.filter((c) => c.slug.toLowerCase() !== slug.toLowerCase()));
  } catch (e) {
    console.warn('Failed to delete category on server:', e);
  }

  return true;
}
