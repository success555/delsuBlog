'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Post } from '@/types/blog';
import { searchPosts } from '@/lib/postsStore';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { formatWATDate } from '@/lib/utils';
import { Search, Clock, ArrowRight, BookOpen } from 'lucide-react';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    const data = await searchPosts(searchTerm);
    setResults(data);
    setIsLoading(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Search Box */}
      <div className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-8 mb-8 border border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
          <Search className="w-6 h-6 text-red-500" />
          <span>Search DELSU Abraka Newsroom</span>
        </h1>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campus bulletins, tech news, Afrobeats..."
            className="flex-1 px-4 py-3 text-sm bg-white text-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md"
          >
            Search
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span>Popular searches:</span>
          {['DELSU Senate', 'Abraka Hub', 'Paystack', 'Burna Boy', 'Super Eagles'].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQuery(term);
                performSearch(term);
              }}
              className="text-red-400 hover:underline hover:text-white"
            >
              #{term}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-zinc-200">
          <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900">
            {query ? `Search Results for "${query}"` : 'All Articles'}
          </h2>
          <span className="text-xs text-zinc-500 font-mono">
            {results.length} result{results.length === 1 ? '' : 's'} found
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-zinc-500 font-mono text-sm">
            Searching DELSU and Nigerian news database...
          </div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-300">
            <BookOpen className="w-10 h-10 text-red-500 mx-auto mb-3 opacity-70" />
            <h3 className="text-base font-bold text-zinc-800">No articles matched your search</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Try searching with broader terms like &quot;DELSU&quot;, &quot;Senate&quot;, &quot;Afrobeats&quot;, or browse our categories.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 hover:border-red-400 hover:shadow-sm transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="relative w-full sm:w-44 aspect-[16/10] sm:aspect-square rounded-lg overflow-hidden shrink-0 bg-zinc-100"
                >
                  <OptimizedImage
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-1.5">
                    <span className="text-red-600 font-bold uppercase tracking-wider">
                      {post.category.replace('-', ' ')}
                    </span>
                    <span>•</span>
                    <span>{formatWATDate(post.published_at, { format: 'short' })}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.reading_time}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-950 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mb-2">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">
                      By {post.author_name}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      Read Story <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-16 text-center text-zinc-500 font-mono text-sm">
          Loading search portal...
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}

