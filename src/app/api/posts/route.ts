import { NextResponse } from 'next/server';
import { getAllPosts, savePost, deletePost } from '@/lib/postsStore';
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const limit = searchParams.get('limit');
  const slug = searchParams.get('slug');

  let posts = await getAllPosts();

  if (slug) {
    const found = posts.find((p) => p.slug === slug || p.id === slug);
    if (!found) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(found);
  }

  if (category && category !== 'all') {
    posts = posts.filter((p) => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    );
  }

  if (limit) {
    const lim = parseInt(limit, 10);
    if (!isNaN(lim)) {
      posts = posts.slice(0, lim);
    }
  }

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const saved = await savePost(body);

    try {
      revalidatePath('/');
      revalidatePath('/blog');
      if (saved.slug) {
        revalidatePath(`/blog/${saved.slug}`);
      }
      revalidatePath('/admin');
    } catch {
      // Ignored outside Next.js request context
    }

    return NextResponse.json(saved, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    await deletePost(id);

    try {
      revalidatePath('/');
      revalidatePath('/blog');
      revalidatePath('/admin');
    } catch {
      // Ignored outside Next.js request context
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
