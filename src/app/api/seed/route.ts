import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { SEED_POSTS, SEED_COMMENTS } from '@/data/seedPosts';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  const client = supabaseAdmin || supabase;

  if (!isSupabaseConfigured || !client) {
    return NextResponse.json({
      configured: false,
      message: 'Supabase credentials are not configured in environment variables.',
      counts: { categories: 0, posts: 0, comments: 0, advertisements: 0 },
    });
  }

  try {
    const [pRes, cRes, comRes, aRes] = await Promise.all([
      client.from('posts').select('id', { count: 'exact', head: true }),
      client.from('categories').select('id', { count: 'exact', head: true }),
      client.from('comments').select('id', { count: 'exact', head: true }),
      client.from('advertisements').select('id', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      configured: true,
      counts: {
        posts: pRes.count ?? 0,
        categories: cRes.count ?? 0,
        comments: comRes.count ?? 0,
        advertisements: aRes.count ?? 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to inspect Supabase tables' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const client = supabaseAdmin || supabase;

  if (!isSupabaseConfigured || !client) {
    return NextResponse.json(
      {
        error:
          'Supabase credentials missing. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.',
      },
      { status: 400 }
    );
  }

  try {
    const results = {
      categories: 0,
      posts: 0,
      comments: 0,
      advertisements: 0,
    };

    // 1. Seed Categories
    let categoriesData = [];
    try {
      const catsPath = path.join(process.cwd(), 'src', 'data', 'categories.json');
      const raw = await fs.readFile(catsPath, 'utf-8');
      categoriesData = JSON.parse(raw);
    } catch {
      categoriesData = [
        { slug: 'campus-updates', name: 'DELSU Abraka Updates', shortName: 'DELSU News', description: 'Campus news', accentColor: 'bg-red-600 text-white' },
        { slug: 'naija-news', name: 'Naija News & Politics', shortName: 'Naija News', description: 'National news', accentColor: 'bg-red-700 text-white' },
        { slug: 'tech-startups', name: 'Tech & Startups', shortName: 'Tech & Startups', description: 'Tech ecosystem', accentColor: 'bg-zinc-800 text-white' },
        { slug: 'afrobeats-entertainment', name: 'Afrobeats & Entertainment', shortName: 'Afrobeats', description: 'Entertainment', accentColor: 'bg-rose-600 text-white' },
        { slug: 'business-economy', name: 'Business & Economy', shortName: 'Business', description: 'Business & Economy', accentColor: 'bg-amber-700 text-white' },
        { slug: 'japa-diaspora', name: 'Japa & Diaspora', shortName: 'Japa', description: 'Diaspora & study visas', accentColor: 'bg-red-800 text-white' },
        { slug: 'super-eagles-sports', name: 'Super Eagles & Sports', shortName: 'Super Eagles', description: 'Sports & football', accentColor: 'bg-red-600 text-white' },
      ];
    }

    if (Array.isArray(categoriesData) && categoriesData.length > 0) {
      const formattedCats = categoriesData.map((c: any, idx: number) => ({
        id: c.id || `cat-${c.slug || idx + 1}`,
        slug: c.slug,
        name: c.name,
        short_name: c.shortName || c.name,
        description: c.description || '',
        accent_color: c.accentColor || 'bg-red-600 text-white',
        display_order: idx,
        is_active: true,
      }));

      const { error: catErr } = await client
        .from('categories')
        .upsert(formattedCats, { onConflict: 'slug' });

      if (catErr) {
        console.warn('Categories seed warning:', catErr.message);
      } else {
        results.categories = formattedCats.length;
      }
    }

    // 2. Seed Posts
    if (Array.isArray(SEED_POSTS) && SEED_POSTS.length > 0) {
      const formattedPosts = SEED_POSTS.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        category: p.category,
        category_slug: p.category,
        cover_image: p.cover_image,
        author_name: p.author_name,
        author_avatar: p.author_avatar,
        author_role: p.author_role,
        reading_time: p.reading_time,
        is_featured: Boolean(p.is_featured),
        is_sponsored: Boolean(p.is_sponsored),
        is_trending: Boolean(p.is_trending),
        views_count: p.views_count,
        published_at: p.published_at,
        created_at: p.published_at,
        status: p.status,
      }));

      const { error: postErr } = await client
        .from('posts')
        .upsert(formattedPosts, { onConflict: 'slug' });

      if (postErr) {
        console.warn('Posts seed warning:', postErr.message);
      } else {
        results.posts = formattedPosts.length;
      }
    }

    // 3. Seed Comments
    if (Array.isArray(SEED_COMMENTS) && SEED_COMMENTS.length > 0) {
      const flatComments: any[] = [];
      for (const c of SEED_COMMENTS) {
        flatComments.push({
          id: c.id,
          post_slug: c.post_slug,
          parent_id: null,
          author_name: c.author_name,
          content: c.content,
          created_at: c.created_at,
          status: 'approved',
        });
        if (c.replies && c.replies.length > 0) {
          for (const r of c.replies) {
            flatComments.push({
              id: r.id,
              post_slug: r.post_slug,
              parent_id: r.parent_id || c.id,
              author_name: r.author_name,
              content: r.content,
              created_at: r.created_at,
              status: 'approved',
            });
          }
        }
      }

      const { error: comErr } = await client
        .from('comments')
        .upsert(flatComments, { onConflict: 'id' });

      if (comErr) {
        console.warn('Comments seed warning:', comErr.message);
      } else {
        results.comments = flatComments.length;
      }
    }

    // 4. Seed Advertisements
    let adsData = [];
    try {
      const adsPath = path.join(process.cwd(), 'src', 'data', 'ads.json');
      const raw = await fs.readFile(adsPath, 'utf-8');
      adsData = JSON.parse(raw);
    } catch {
      adsData = [
        {
          id: 'ad-leaderboard',
          slot: 'leaderboard',
          title: 'Promote Your Campus Brand, Product or Event on Delsu Abraka Blog TV',
          image_url: '',
          target_url: 'https://wa.me/message/J3ZOIRSKCSMZM1',
          sponsor_name: 'DELSU Media Partner',
          is_active: false,
          clicks_count: 0,
        },
        {
          id: 'ad-sidebar',
          slot: 'sidebar',
          title: 'Target 25,000+ DELSU Students and Nigerian Readers',
          image_url: '',
          target_url: 'https://wa.me/message/J3ZOIRSKCSMZM1',
          sponsor_name: 'Campus Ad Partner',
          is_active: false,
          clicks_count: 0,
        },
        {
          id: 'ad-in-article',
          slot: 'in-article',
          title: 'Need Fast Off-Campus Accommodation in Abraka or Student Deals?',
          image_url: '',
          target_url: 'https://wa.me/message/J3ZOIRSKCSMZM1',
          sponsor_name: 'Abraka Student Housing',
          is_active: false,
          clicks_count: 0,
        },
      ];
    }

    if (Array.isArray(adsData) && adsData.length > 0) {
      const formattedAds = adsData.map((a: any) => ({
        id: a.id || `ad-${a.slot}`,
        slot: a.slot,
        title: a.title,
        image_url: a.image_url || '',
        target_url: a.target_url || 'https://wa.me/message/J3ZOIRSKCSMZM1',
        sponsor_name: a.sponsor_name || 'DELSU Ad Partner',
        is_active: Boolean(a.is_active),
        clicks_count: a.clicks_count || 0,
        updated_at: new Date().toISOString(),
      }));

      const { error: adErr } = await client
        .from('advertisements')
        .upsert(formattedAds, { onConflict: 'slot' });

      if (adErr) {
        console.warn('Advertisements seed warning:', adErr.message);
      } else {
        results.advertisements = formattedAds.length;
      }
    }

    // Revalidate website static caches
    try {
      revalidatePath('/');
      revalidatePath('/blog');
      revalidatePath('/category');
      revalidatePath('/admin');
    } catch {
      // Ignored outside Next.js request context
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase database successfully synchronized and seeded with DELSU production dataset!',
      results,
    });
  } catch (err: any) {
    console.error('Database seeding failed:', err);
    return NextResponse.json(
      { error: err.message || 'Seeding failed' },
      { status: 500 }
    );
  }
}

