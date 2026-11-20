import React from 'react';
import Link from 'next/link';
import { Post } from '@/types/blog';
import { Flame, Eye, PhoneCall, CheckCircle } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';

interface TrendingSidebarProps {
  trendingPosts: Post[];
}

export function TrendingSidebar({ trendingPosts }: TrendingSidebarProps) {
  return (
    <aside className="space-y-6">
      
      {/* Trending Box */}
      <div className="bg-white border-2 border-red-600 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-100">
          <div className="p-1.5 bg-red-600 text-white rounded-lg">
            <Flame className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
              Trending in Nigeria & DELSU
            </h3>
            <span className="text-[10px] text-zinc-500">Most read stories in the past 24 hours</span>
          </div>
        </div>

        <div className="space-y-4 divide-y divide-zinc-100">
          {trendingPosts.slice(0, 5).map((post, index) => (
            <div key={post.id} className={`pt-3.5 first:pt-0 flex items-start gap-3 group`}>
              <div className="w-7 h-7 rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block mb-0.5">
                  {post.category.replace('-', ' ')}
                </span>
                <h4 className="text-xs font-bold text-zinc-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1 font-mono">
                  <span className="flex items-center gap-0.5">
                    <Eye className="w-3 h-3" />
                    {(post.views_count || 1200).toLocaleString()} reads
                  </span>
                  <span>•</span>
                  <span>{post.reading_time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 300x250 Ad Slot */}
      <AdSlot type="sidebar" />

      {/* DELSU Abraka Student Quick Bulletin */}
      <div className="bg-zinc-900 text-white rounded-2xl p-5 shadow-sm border border-zinc-800">
        <div className="flex items-center gap-2 mb-3">
          <PhoneCall className="w-4 h-4 text-red-500" />
          <h4 className="text-xs font-black uppercase tracking-wider text-white">
            DELSU Emergency Hotlines
          </h4>
        </div>
        <p className="text-[11px] text-zinc-400 mb-3">
          Official Delta State University Abraka campus security, clinic, and student welfare contacts.
        </p>

        <ul className="space-y-2 text-xs">
          <li className="flex items-center justify-between py-1 border-b border-zinc-800">
            <span className="text-zinc-300">Site II / III Security Post</span>
            <span className="font-mono text-red-400 font-bold">0803-DELSU-SEC</span>
          </li>
          <li className="flex items-center justify-between py-1 border-b border-zinc-800">
            <span className="text-zinc-300">Abraka Health Services Clinic</span>
            <span className="font-mono text-red-400 font-bold">0812-DELSU-MED</span>
          </li>
          <li className="flex items-center justify-between py-1 border-b border-zinc-800">
            <span className="text-zinc-300">Dean of Student Affairs</span>
            <span className="font-mono text-red-400 font-bold">0806-DELSU-DSA</span>
          </li>
        </ul>

        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-2 text-[10px] text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Verified by DELSU Student Union Government</span>
        </div>
      </div>

    </aside>
  );
}

