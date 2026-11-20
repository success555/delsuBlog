import { NextResponse } from 'next/server';
import { getAllCategories, saveCategory, deleteCategory } from '@/lib/categoriesStore';
import { revalidatePath } from 'next/cache';

export async function GET() {
  const categories = await getAllCategories();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    const saved = await saveCategory(body);

    try {
      revalidatePath('/');
      revalidatePath('/category');
      revalidatePath(`/category/${saved.slug}`);
      revalidatePath('/admin');
    } catch {
      // Ignored outside Next.js request context
    }

    return NextResponse.json(saved, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save category';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
    }
    await deleteCategory(slug);

    try {
      revalidatePath('/');
      revalidatePath('/category');
      revalidatePath('/admin');
    } catch {
      // Ignored outside Next.js request context
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete category';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
