import { CategoryInfo } from '@/types/blog';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { slugify } from '@/lib/utils';

const LOCAL_STORAGE_CATEGORIES_KEY = 'delsu_blog_categories_v1';

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
  // 1. Supabase check
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as CategoryInfo[];
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
  const cats = await getAllCategories();
  const slug = categoryData.slug
    ? slugify(categoryData.slug)
    : slugify(categoryData.name || 'category');

  const existingIndex = cats.findIndex(
    (c) => c.slug.toLowerCase() === slug.toLowerCase() || (categoryData.id && c.id === categoryData.id)
  );

  let saved: CategoryInfo;

  if (existingIndex !== -1) {
    saved = {
      ...cats[existingIndex],
      ...categoryData,
      slug,
      name: categoryData.name || cats[existingIndex].name,
      shortName: categoryData.shortName || categoryData.name || cats[existingIndex].shortName,
      description: categoryData.description || cats[existingIndex].description,
      accentColor:
        categoryData.accentColor || cats[existingIndex].accentColor || 'bg-red-600 text-white',
    };
    cats[existingIndex] = saved;
  } else {
    saved = {
      id: categoryData.id || `cat-${Date.now()}`,
      slug,
      name: categoryData.name || 'New Category',
      shortName: categoryData.shortName || categoryData.name || 'Category',
      description:
        categoryData.description ||
        `Latest articles and news filed under ${categoryData.name}.`,
      accentColor: categoryData.accentColor || 'bg-red-600 text-white',
      created_at: new Date().toISOString(),
      is_default: false,
    };
    cats.push(saved);
  }

  // Server write
  if (typeof window === 'undefined') {
    try {
      const { saveServerCategories } = await import('@/lib/serverData');
      await saveServerCategories(cats);
    } catch (e) {
      console.warn('Failed to save categories on server:', e);
    }
  } else {
    saveClientStoredCategories(cats);
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saved),
      });
    } catch (e) {
      console.warn('API save category failed:', e);
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('categories').upsert(saved);
    } catch (e) {
      console.warn('Supabase category upsert failed:', e);
    }
  }

  return saved;
}

export async function deleteCategory(slug: string): Promise<boolean> {
  const cats = await getAllCategories();
  const filtered = cats.filter((c) => c.slug.toLowerCase() !== slug.toLowerCase());

  if (typeof window === 'undefined') {
    try {
      const { saveServerCategories } = await import('@/lib/serverData');
      await saveServerCategories(filtered);
    } catch (e) {
      console.warn('Failed to delete category on server:', e);
    }
  } else {
    saveClientStoredCategories(filtered);
    try {
      await fetch(`/api/categories?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('API delete category failed:', e);
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('categories').delete().eq('slug', slug);
    } catch (e) {
      console.warn('Supabase category delete failed:', e);
    }
  }

  return true;
}
