import { NextResponse } from 'next/server';
import { getAllCategories, saveCategory, deleteCategory } from '@/lib/categoriesStore';

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
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete category';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
