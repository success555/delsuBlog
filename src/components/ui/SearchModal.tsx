'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, BookOpen } from 'lucide-react';
import { Post } from '@/types/blog';
import { searchPosts } from '@/lib/postsStore';
import Link from 'next/link';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const res = await searchPosts(query);
      setResults(res);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-red-100 overflow-hidden z-10">
        {/* Header & Search Input */}
        <form onSubmit={handleSubmit} className="flex items-center px-4 py-3.5 border-b border-zinc-200 bg-white">
          <Search className="w-5 h-5 text-red-600 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search DELSU updates, Naija news, tech, Afrobeats..."
            className="w-full text-base bg-transparent focus:outline-none text-zinc-900 placeholder:text-zinc-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-2 px-2 py-1 text-xs font-semibold text-zinc-600 hover:text-red-600 bg-zinc-100 rounded"
          >
            ESC
          </button>
        </form>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-zinc-100">
          {isLoading && (
            <div className="py-8 text-center text-zinc-400 text-sm">
              Searching articles...
            </div>
          )}

          {!isLoading && query && results.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-zinc-600 font-medium">No articles found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-zinc-400 mt-1">Try searching for &quot;DELSU&quot;, &quot;Senate&quot;, &quot;Afrobeats&quot;, or &quot;Fintech&quot;</p>
            </div>
          )}

          {!isLoading && !query && (
            <div className="py-6 px-2 text-center text-zinc-500">
              <BookOpen className="w-8 h-8 text-red-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium text-zinc-700">Quick Search Delsu Abraka Blog</p>
              <p className="text-xs text-zinc-400 mt-1">Type keywords to search across all stories, campus updates, and headlines.</p>
              
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                {['DELSU Senate', 'Abraka Hub', 'Flutterwave', 'Burna Boy', 'Super Eagles', 'Japa'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="text-xs px-2.5 py-1 bg-red-50 text-red-700 rounded-full hover:bg-red-100 border border-red-200 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              onClick={onClose}
              className="flex items-start justify-between py-3 px-2 group hover:bg-red-50/60 rounded-lg transition-colors"
            >
              <div className="pr-4">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-red-600 mb-1">
                  {post.category.replace('-', ' ')}
                </span>
                <h4 className="text-sm font-semibold text-zinc-900 group-hover:text-red-700 line-clamp-1">
                  {post.title}
                </h4>
                <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                  {post.excerpt}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-red-600 shrink-0 self-center transform group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>

        {results.length > 0 && (
          <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-500">
            <span>Found {results.length} result(s)</span>
            <button
              onClick={handleSubmit}
              className="text-red-600 font-semibold hover:underline flex items-center gap-1"
            >
              View all results <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

