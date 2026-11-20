import { NextResponse } from 'next/server';
import { getAllPosts, savePost } from '@/lib/postsStore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const limit = searchParams.get('limit');

  let posts = await getAllPosts();

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
    return NextResponse.json(saved, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

