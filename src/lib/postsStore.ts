import { Post, Comment } from '@/types/blog';
import { SEED_COMMENTS } from '@/data/seedPosts';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const LOCAL_STORAGE_POSTS_KEY = 'delsu_blog_posts_v1';
const LOCAL_STORAGE_COMMENTS_KEY = 'delsu_blog_comments_v1';

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
  // 1. Supabase check
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('published_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as Post[];
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

  // 3. Client check
  const local = getClientStoredPosts();
  if (local) return local;

  return [];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();
      if (!error && data) {
        return data as Post;
      }
    } catch (err) {
      console.warn('Supabase fetch by slug failed:', err);
    }
  }

  const posts = await getAllPosts();
  const cleanSlug = slug.toLowerCase().trim();
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
  const cleanCategory = categorySlug.toLowerCase().trim();
  return posts.filter(
    (p) =>
      p.status === 'published' &&
      (p.category.toLowerCase().trim() === cleanCategory || cleanCategory === 'all')
  );
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
  const posts = await getAllPosts();
  const now = new Date().toISOString();

  let savedPost: Post;

  if (post.id) {
    const index = posts.findIndex((p) => p.id === post.id);
    if (index !== -1) {
      savedPost = {
        ...posts[index],
        ...post,
      } as Post;
      posts[index] = savedPost;
    } else {
      savedPost = {
        id: post.id,
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
        is_featured: !!post.is_featured,
        is_sponsored: !!post.is_sponsored,
        is_trending: !!post.is_trending,
        views_count: post.views_count || 120,
        published_at: post.published_at || now,
        created_at: post.created_at || now,
        status: post.status || 'published',
      };
      posts.unshift(savedPost);
    }
  } else {
    savedPost = {
      id: `post-${Date.now()}`,
      slug: post.slug || `article-${Date.now()}`,
      title: post.title || 'Untitled Post',
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
      reading_time: post.reading_time || '4 min read',
      is_featured: !!post.is_featured,
      is_sponsored: !!post.is_sponsored,
      is_trending: !!post.is_trending,
      views_count: 50,
      published_at: now,
      created_at: now,
      status: post.status || 'published',
    };
    posts.unshift(savedPost);
  }

  // Server write
  if (typeof window === 'undefined') {
    try {
      const { saveServerPosts } = await import('@/lib/serverData');
      await saveServerPosts(posts);
    } catch (e) {
      console.warn('Failed to save posts on server:', e);
    }
  } else {
    saveClientStoredPosts(posts);
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedPost),
      });
    } catch (e) {
      console.warn('API save post failed:', e);
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('posts').upsert(savedPost);
    } catch (e) {
      console.warn('Supabase upsert failed:', e);
    }
  }

  return savedPost;
}

export async function deletePost(id: string): Promise<boolean> {
  const posts = await getAllPosts();
  const filtered = posts.filter((p) => p.id !== id);

  if (typeof window === 'undefined') {
    try {
      const { saveServerPosts } = await import('@/lib/serverData');
      await saveServerPosts(filtered);
    } catch (e) {
      console.warn('Failed to delete post on server:', e);
    }
  } else {
    saveClientStoredPosts(filtered);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('posts').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete failed:', e);
    }
  }

  return true;
}

export async function getCommentsForPost(postSlug: string): Promise<Comment[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_slug', postSlug)
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        const parentComments = data.filter((c) => !c.parent_id);
        return parentComments.map((p) => ({
          ...p,
          replies: data.filter((c) => c.parent_id === p.id),
        }));
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
  const newComment: Comment = {
    id: `comm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    created_at: new Date().toISOString(),
    is_approved: true,
    ...comment,
    replies: [],
  };

  const allComments = getClientStoredComments() || runtimeComments;
  const updated = [...allComments, newComment];
  runtimeComments = updated;
  saveClientStoredComments(updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('comments').insert({
        id: newComment.id,
        post_slug: newComment.post_slug,
        parent_id: newComment.parent_id || null,
        author_name: newComment.author_name,
        author_email: newComment.author_email || null,
        content: newComment.content,
        created_at: newComment.created_at,
        is_approved: true,
      });
    } catch (e) {
      console.warn('Supabase comment insert failed:', e);
    }
  }

  return newComment;
}
