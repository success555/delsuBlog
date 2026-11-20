import { NextResponse } from 'next/server';
import { getCommentsForPost, addComment } from '@/lib/postsStore';
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Post slug is required' }, { status: 400 });
  }

  const comments = await getCommentsForPost(slug);
  return NextResponse.json(comments);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.post_slug || !body.author_name || !body.content) {
      return NextResponse.json(
        { error: 'Missing required comment fields' },
        { status: 400 }
      );
    }

    const newComment = await addComment({
      post_slug: body.post_slug,
      parent_id: body.parent_id || null,
      author_name: body.author_name,
      author_email: body.author_email || null,
      content: body.content,
    });

    try {
      revalidatePath(`/blog/${body.post_slug}`);
      revalidatePath('/');
    } catch {
      // Ignored outside Next.js request context
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to post comment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
