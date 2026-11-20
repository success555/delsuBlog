import { CategoryInfo } from '@/types/blog';
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/data/categories';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { slugify } from '@/lib/utils';

const LOCAL_STORAGE_CATEGORIES_KEY = 'delsu_blog_categories_v1';

let runtimeCategories: CategoryInfo[] = [...DEFAULT_CATEGORIES];

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
    // Trigger storage event for cross-component sync
    window.dispatchEvent(new CustomEvent('delsu_categories_updated', { detail: cats }));
  } catch (err) {
    console.error('Failed to save categories to localStorage', err);
  }
}

export async function getAllCategories(): Promise<CategoryInfo[]> {
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
      console.warn('Supabase categories fetch failed, using fallback:', err);
    }
  }

  const local = getClientStoredCategories();
  if (local) return local;

  return runtimeCategories;
}

export async function getCategoryBySlug(slug: string): Promise<CategoryInfo | undefined> {
  const cats = await getAllCategories();
  return cats.find((c) => c.slug === slug);
}

export async function saveCategory(categoryData: Partial<CategoryInfo>): Promise<CategoryInfo> {
  const cats = await getAllCategories();
  const slug = categoryData.slug ? slugify(categoryData.slug) : slugify(categoryData.name || 'category');

  const existingIndex = cats.findIndex((c) => c.slug === slug || (categoryData.id && c.id === categoryData.id));

  let saved: CategoryInfo;

  if (existingIndex !== -1) {
    saved = {
      ...cats[existingIndex],
      ...categoryData,
      slug,
      name: categoryData.name || cats[existingIndex].name,
      shortName: categoryData.shortName || categoryData.name || cats[existingIndex].shortName,
      description: categoryData.description || cats[existingIndex].description,
      accentColor: categoryData.accentColor || cats[existingIndex].accentColor || 'bg-red-600 text-white',
    };
    cats[existingIndex] = saved;
  } else {
    saved = {
      id: categoryData.id || `cat-${Date.now()}`,
      slug,
      name: categoryData.name || 'New Category',
      shortName: categoryData.shortName || categoryData.name || 'Category',
      description: categoryData.description || 'Category updates and news.',
      accentColor: categoryData.accentColor || 'bg-red-600 text-white',
      created_at: new Date().toISOString(),
      is_default: false,
    };
    cats.push(saved);
  }

  runtimeCategories = cats;
  saveClientStoredCategories(cats);

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
  const filtered = cats.filter((c) => c.slug !== slug);
  runtimeCategories = filtered;
  saveClientStoredCategories(filtered);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('categories').delete().eq('slug', slug);
    } catch (e) {
      console.warn('Supabase category delete failed:', e);
    }
  }

  return true;
}
