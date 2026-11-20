import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getPostsByCategory } from '@/lib/postsStore';
import { getAllCategories, getCategoryBySlug } from '@/lib/categoriesStore';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { formatWATDate } from '@/lib/utils';
import { Clock, ChevronRight, BookOpen } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateStaticParams() {
  const cats = await getAllCategories();
  return cats.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const cat = await getCategoryBySlug(params.category);
  return {
    title: `${cat.name} News & Updates | Delsu Abraka Blog TV`,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryInfo = await getCategoryBySlug(params.category);
  const posts = await getPostsByCategory(params.category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6 font-medium">
        <Link href="/" className="hover:text-red-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-red-600 font-bold uppercase tracking-wider">
          {categoryInfo.name}
        </span>
      </nav>

      {/* Category Banner */}
      <div className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-10 mb-10 border-t-4 border-red-600 relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl">
          <span className="text-xs font-black uppercase tracking-widest text-red-500 block mb-2">
            DELSU Abraka Newsroom Archive
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
            {categoryInfo.name}
          </h1>
          <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
            {categoryInfo.description}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-mono text-zinc-400">
            <BookOpen className="w-4 h-4 text-red-500" />
            <span>Showing {posts.length} published stor{posts.length === 1 ? 'y' : 'ies'}</span>
          </div>
        </div>
      </div>

      {/* 728x90 Leaderboard Ad */}
      <AdSlot type="leaderboard" />

      {/* Articles Grid */}
      {posts.length === 0 ? (
        <div className="py-16 text-center bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-6">
          <BookOpen className="w-10 h-10 text-red-500 mx-auto mb-3 opacity-70" />
          <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">No published stories in &quot;{categoryInfo.name}&quot; yet.</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Our campus reporters and desk editors are actively working on stories. You can publish an article in this category from the Admin CMS.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-xs"
            >
              Back to Homepage
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors shadow-xs"
            >
              Go to CMS Editor
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-red-400 dark:hover:border-red-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="relative aspect-[16/10] block overflow-hidden bg-zinc-100 dark:bg-zinc-800"
                >
                  <OptimizedImage
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                  {post.is_sponsored && (
                    <span className="absolute top-3 right-3 bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow">
                      Sponsored
                    </span>
                  )}
                </Link>

                <div className="p-5">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mb-2 font-medium">
                    <span>{formatWATDate(post.published_at, { format: 'short' })}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      {post.reading_time}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug mb-2">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-zinc-100 dark:border-zinc-800 mt-2 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  By {post.author_name}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-0.5"
                >
                  Read Story →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

    </div>
  );
}
