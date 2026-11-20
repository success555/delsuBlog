import React from 'react';
import Link from 'next/link';
import { Post } from '@/types/blog';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { BookOpen, ArrowRight } from 'lucide-react';

interface ReadAlsoBoxProps {
  post: Post;
}

export function ReadAlsoBox({ post }: ReadAlsoBoxProps) {
  if (!post) return null;

  return (
    <aside className="my-8 p-4 sm:p-5 bg-red-50/60 border-l-4 border-red-600 rounded-r-xl shadow-xs">
      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-red-600 mb-2">
        <BookOpen className="w-4 h-4" />
        <span>READ ALSO:</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-20 h-16 sm:w-24 sm:h-16 rounded-lg overflow-hidden shrink-0 bg-zinc-200">
          <OptimizedImage
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm sm:text-base font-bold text-zinc-950 hover:text-red-600 transition-colors line-clamp-2 leading-snug">
            <Link href={`/blog/${post.slug}`}>
              {post.title}
            </Link>
          </h4>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1">
            <span className="uppercase text-red-600 font-semibold">{post.category.replace('-', ' ')}</span>
            <span>•</span>
            <span>{post.reading_time}</span>
          </div>
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="hidden sm:inline-flex p-2 bg-white rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-colors shrink-0 shadow-xs border border-red-100"
          aria-label="Read recommended post"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}

