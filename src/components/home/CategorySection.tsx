import React from 'react';
import Link from 'next/link';
import { Post, CategoryInfo } from '@/types/blog';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { formatWATDate } from '@/lib/utils';
import { ArrowRight, Clock } from 'lucide-react';

interface CategorySectionProps {
  category: CategoryInfo;
  posts: Post[];
}

export function CategorySection({ category, posts }: CategorySectionProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="my-10">
      
      {/* Category Header */}
      <div className="flex items-end justify-between pb-3 mb-6 border-b-2 border-red-600">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 block mb-0.5">
            Category Spotlight
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-950 font-sans tracking-tight">
            {category.name}
          </h2>
        </div>

        <Link
          href={`/category/${category.slug}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wider group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.slice(0, 3).map((post) => (
          <article
            key={post.id}
            className="group bg-white rounded-xl border border-zinc-200 overflow-hidden hover:border-red-400 hover:shadow-md transition-all flex flex-col"
          >
            <Link
              href={`/blog/${post.slug}`}
              className="relative aspect-[16/10] overflow-hidden bg-zinc-100"
            >
              <OptimizedImage
                src={post.cover_image}
                alt={post.title}
                fill
                className="group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                {category.shortName}
              </span>
              {post.is_sponsored && (
                <span className="absolute top-3 right-3 bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow">
                  Sponsored
                </span>
              )}
            </Link>

            <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-2 font-medium">
                  <span>{formatWATDate(post.published_at, { format: 'short' })}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    {post.reading_time}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-zinc-950 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mb-2">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>

                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-zinc-700">
                  By {post.author_name}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5"
                >
                  Read →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

    </section>
  );
}

