import { Post, Comment } from '@/types/blog';
import { SEED_POSTS, SEED_COMMENTS } from '@/data/seedPosts';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

const LOCAL_STORAGE_POSTS_KEY = 'delsu_blog_posts_v1';
const LOCAL_STORAGE_COMMENTS_KEY = 'delsu_blog_comments_v1';

function getDbClient() {
  if (typeof window === 'undefined') {
    return supabaseAdmin || supabase;
  }
  return supabase;
}

function getClientStoredPosts(): Post[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function saveClientStoredPosts(posts: Post[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(posts));
  } catch (err) {
    console.error('Failed to save posts to localStorage', err);
  }
}

function getClientStoredComments(): Comment[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_COMMENTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveClientStoredComments(comments: Comment[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_COMMENTS_KEY, JSON.stringify(comments));
  } catch (err) {
    console.error('Failed to save comments to localStorage', err);
  }
}

let runtimeComments: Comment[] = [...SEED_COMMENTS];

export async function getAllPosts(): Promise<Post[]> {
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
      console.warn('Supabase fetch failed:', err);
    }
  }

  // 2. Server check
  if (typeof window === 'undefined') {
    try {
      const { getServerPosts } = await import('@/lib/serverData');
      const serverPosts = await getServerPosts();
      if (serverPosts && serverPosts.length > 0) return serverPosts;
    } catch {
      // Fallback
    }
  }

  // 3. Client localStorage check
  const local = getClientStoredPosts();
  if (local) return local;

  // 4. Default Seed Posts Fallback
  return SEED_POSTS;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const client = getDbClient();
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Supabase primary direct lookup
  if (client) {
    try {
      const { data, error } = await client
        .from('posts')
        .select('*')
        .or(`slug.eq.${cleanSlug},id.eq.${cleanSlug}`)
        .maybeSingle();

      if (!error && data) {
        return {
          ...data,
          category: data.category || data.category_slug || 'campus-updates',
        } as Post;
      }
    } catch (err) {
      console.warn('Supabase fetch by slug failed:', err);
    }
  }

  // 2. Search all posts fallback
  const posts = await getAllPosts();
  return (
    posts.find(
      (p) =>
        p.slug.toLowerCase().trim() === cleanSlug ||
        p.id.toLowerCase().trim() === cleanSlug
    ) || null
  );
}

export async function getPostsByCategory(categorySlug: string): Promise<Post[]> {
  const posts = await getAllPosts();
  const clean = categorySlug.toLowerCase().trim();
  const singular = clean.endsWith('s') ? clean.slice(0, -1) : clean;
  const plural = clean.endsWith('s') ? clean : `${clean}s`;

  return posts.filter((p) => {
    if (p.status !== 'published') return false;
    const postCat = p.category.toLowerCase().trim();
    if (clean === 'all') return true;
    if (postCat === clean || postCat === singular || postCat === plural) return true;
    if (
      (clean === 'sports' || clean === 'sport') &&
      (postCat === 'sport' || postCat === 'sports' || postCat === 'super-eagles-sports')
    ) {
      return true;
    }
    return false;
  });
}

export async function getFeaturedPost(): Promise<Post | null> {
  const posts = await getAllPosts();
  const featured = posts.find((p) => p.status === 'published' && p.is_featured);
  return featured || posts[0] || null;
}

export async function getTrendingPosts(limit: number = 5): Promise<Post[]> {
  const posts = await getAllPosts();
  const published = posts.filter((p) => p.status === 'published');

  const sorted = [...published].sort((a, b) => {
    if (a.is_trending && !b.is_trending) return -1;
    if (!a.is_trending && b.is_trending) return 1;
    return (b.views_count || 0) - (a.views_count || 0);
  });

  return sorted.slice(0, limit);
}

export async function getRelatedPosts(
  currentSlug: string,
  category: string,
  limit: number = 3
): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts
    .filter(
      (p) =>
        p.status === 'published' &&
        p.slug !== currentSlug &&
        p.category.toLowerCase() === category.toLowerCase()
    )
    .slice(0, limit);
}

export async function searchPosts(query: string): Promise<Post[]> {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const posts = await getAllPosts();
  return posts.filter(
    (p) =>
      p.status === 'published' &&
      (p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q))
  );
}

export async function savePost(post: Partial<Post>): Promise<Post> {
  // If client-side, delegate to full-stack API route
  if (typeof window !== 'undefined') {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save post');
    }

    const saved: Post = await res.json();
    const currentLocal = getClientStoredPosts() || [];
    const updated = [saved, ...currentLocal.filter((p) => p.id !== saved.id && p.slug !== saved.slug)];
    saveClientStoredPosts(updated);
    window.dispatchEvent(new CustomEvent('delsu_posts_updated', { detail: saved }));
    return saved;
  }

  // Server-side implementation
  const now = new Date().toISOString();
  const savedPost: Post = {
    id: post.id || `post-${Date.now()}`,
    slug: post.slug || `post-${Date.now()}`,
    title: post.title || 'Untitled Article',
    excerpt: post.excerpt || '',
    content: post.content || '',
    category: post.category || 'campus-updates',
    cover_image:
      post.cover_image ||
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    author_name: post.author_name || 'Blessing Onome Okonjo',
    author_avatar:
      post.author_avatar ||
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    author_role: post.author_role || 'DELSU Campus Editor & SUG Bureau Lead',
    reading_time: post.reading_time || '3 min read',
    is_featured: Boolean(post.is_featured),
    is_sponsored: Boolean(post.is_sponsored),
    is_trending: Boolean(post.is_trending),
    views_count: post.views_count ?? 120,
    published_at: post.published_at || now,
    created_at: post.created_at || now,
    status: post.status || 'published',
  };

  const client = getDbClient();
  if (client) {
    try {
      const dbPayload = {
        ...savedPost,
        category_slug: savedPost.category,
      };
      await client.from('posts').upsert(dbPayload, { onConflict: 'slug' });
    } catch (e) {
      console.warn('Supabase post upsert error:', e);
    }
  }

  try {
    const { getServerPosts, saveServerPosts } = await import('@/lib/serverData');
    const existing = await getServerPosts();
    const updated = [savedPost, ...existing.filter((p) => p.id !== savedPost.id && p.slug !== savedPost.slug)];
    await saveServerPosts(updated);
  } catch (e) {
    console.warn('Failed to save post to local fallback:', e);
  }

  return savedPost;
}

export async function deletePost(id: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    const res = await fetch(`/api/posts?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error('Failed to delete post');
    }
    const current = getClientStoredPosts() || [];
    saveClientStoredPosts(current.filter((p) => p.id !== id));
    return true;
  }

  const client = getDbClient();
  if (client) {
    try {
      await client.from('posts').delete().or(`id.eq.${id},slug.eq.${id}`);
    } catch (e) {
      console.warn('Supabase delete error:', e);
    }
  }

  try {
    const { getServerPosts, saveServerPosts } = await import('@/lib/serverData');
    const existing = await getServerPosts();
    await saveServerPosts(existing.filter((p) => p.id !== id && p.slug !== id));
  } catch (e) {
    console.warn('Failed to delete post from local fallback:', e);
  }

  return true;
}

// ==========================================
// COMMENTS
// ==========================================
export async function getCommentsForPost(postSlug: string): Promise<Comment[]> {
  const client = getDbClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('comments')
        .select('*')
        .eq('post_slug', postSlug)
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const parentComments = data.filter((c: any) => !c.parent_id);
        return parentComments.map((p: any) => ({
          ...p,
          replies: data.filter((c: any) => c.parent_id === p.id),
        })) as Comment[];
      }
    } catch (e) {
      console.warn('Supabase get comments failed:', e);
    }
  }

  const localComments = getClientStoredComments() || runtimeComments;
  const filtered = localComments.filter((c) => c.post_slug === postSlug);

  const parentComments = filtered.filter((c) => !c.parent_id);
  return parentComments.map((p) => ({
    ...p,
    replies: filtered.filter((c) => c.parent_id === p.id),
  }));
}

export async function addComment(comment: Omit<Comment, 'id' | 'created_at'>): Promise<Comment> {
  // If in browser, call API route
  if (typeof window !== 'undefined') {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit comment');
    }

    const saved: Comment = await res.json();
    const all = getClientStoredComments() || runtimeComments;
    saveClientStoredComments([...all, saved]);
    return saved;
  }

  // Server-side insertion
  const newComment: Comment = {
    id: `comm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    created_at: new Date().toISOString(),
    is_approved: true,
    ...comment,
    replies: [],
  };

  const client = getDbClient();
  if (client) {
    try {
      await client.from('comments').insert({
        id: newComment.id,
        post_slug: newComment.post_slug,
        parent_id: newComment.parent_id || null,
        author_name: newComment.author_name,
        author_email: newComment.author_email || null,
        content: newComment.content,
        created_at: newComment.created_at,
        status: 'approved',
      });
    } catch (e) {
      console.warn('Supabase comment insert failed:', e);
    }
  }

  runtimeComments = [...runtimeComments, newComment];
  return newComment;
}
