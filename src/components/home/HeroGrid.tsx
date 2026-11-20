import React from 'react';
import Link from 'next/link';
import { Post } from '@/types/blog';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { StaffAvatar } from '@/components/ui/StaffAvatar';
import { formatWATDate } from '@/lib/utils';
import { Clock, TrendingUp } from 'lucide-react';

interface HeroGridProps {
  leadPost: Post;
  secondaryPosts: Post[];
}

export function HeroGrid({ leadPost, secondaryPosts }: HeroGridProps) {
  if (!leadPost) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4 border-b-2 border-red-600 pb-2">
        <TrendingUp className="w-5 h-5 text-red-600" />
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900">
          Top Stories & Breaking Cover
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Lead Story (7 cols on desktop) */}
        <div className="lg:col-span-7">
          <article className="group relative bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
            <Link href={`/blog/${leadPost.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-zinc-100">
              <OptimizedImage
                src={leadPost.cover_image}
                alt={leadPost.title}
                fill
                priority
                className="group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-md shadow-md">
                  Lead Story
                </span>
                {leadPost.is_sponsored && (
                  <span className="px-2.5 py-1 bg-amber-400 text-black text-xs font-black uppercase tracking-wider rounded-md">
                    Sponsored
                  </span>
                )}
              </div>
            </Link>

            <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs text-zinc-500 mb-2.5 font-medium">
                  <span className="text-red-600 font-bold uppercase tracking-wider">
                    {leadPost.category.replace('-', ' ')}
                  </span>
                  <span>•</span>
                  <span>{formatWATDate(leadPost.published_at, { format: 'relative' })}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {leadPost.reading_time}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 group-hover:text-red-600 transition-colors tracking-tight leading-tight mb-3">
                  <Link href={`/blog/${leadPost.slug}`}>
                    {leadPost.title}
                  </Link>
                </h1>

                <p className="text-sm text-zinc-600 line-clamp-3 leading-relaxed mb-4">
                  {leadPost.excerpt}
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <StaffAvatar
                    name={leadPost.author_name}
                    avatar={leadPost.author_avatar}
                    size="sm"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block leading-tight">
                      {leadPost.author_name}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      {leadPost.author_role}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/blog/${leadPost.slug}`}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 group-hover:translate-x-1 transition-all"
                >
                  Read Story →
                </Link>
              </div>
            </div>
          </article>
        </div>

        {/* 3 Secondary Stories (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {secondaryPosts.slice(0, 3).map((post, idx) => (
            <article
              key={post.id}
              className="group bg-white border border-zinc-200 rounded-xl p-3 sm:p-4 hover:border-red-300 hover:shadow-sm transition-all flex gap-4 items-center"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="relative w-28 h-24 sm:w-32 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-zinc-100"
              >
                <OptimizedImage
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  #{idx + 2}
                </span>
              </Link>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-1">
                  <span className="text-red-600 font-bold uppercase tracking-wider text-[10px]">
                    {post.category.replace('-', ' ')}
                  </span>
                  <span>•</span>
                  <span>{post.reading_time}</span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>

                <span className="text-[10px] text-zinc-400 mt-1">
                  {formatWATDate(post.published_at, { format: 'relative' })}
                </span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

