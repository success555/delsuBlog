import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { isSupabaseConfigured, uploadToSupabaseStorage } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'cover'; // 'cover' | 'avatar' | 'media' | 'ad'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize and generate safe filename
    const ext = path.extname(file.name) || '.jpg';
    const cleanName = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const fileName = `${type}-${Date.now()}-${cleanName}${ext}`;

    // 1. If Supabase Storage is configured, attempt upload to Supabase bucket
    if (isSupabaseConfigured) {
      const bucketName =
        type === 'avatar'
          ? 'staff-avatars'
          : type === 'media' || type === 'ad'
          ? 'media-uploads'
          : 'post-covers';

      const { url: supabaseUrl, error: supabaseError } = await uploadToSupabaseStorage(
        bucketName,
        fileName,
        buffer,
        file.type || 'image/jpeg'
      );

      if (supabaseUrl && !supabaseError) {
        return NextResponse.json({
          success: true,
          url: supabaseUrl,
          storage: 'supabase',
          bucket: bucketName,
          fileName,
        });
      }

      console.warn('Supabase storage upload failed, falling back to local storage:', supabaseError);
    }

    // 2. Local File System Fallback (Works offline / without Supabase credentials)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      storage: 'local',
      fileName,
    });
  } catch (error: unknown) {
    console.error('File upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
