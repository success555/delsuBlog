import React from 'react';
import Link from 'next/link';
import { Radio, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-red-100 text-red-600 rounded-3xl mb-4">
        <Radio className="w-12 h-12" />
      </div>

      <span className="text-xs font-black uppercase tracking-widest text-red-600 mb-1">
        404 • Story Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 font-sans tracking-tight mb-3">
        Page or Article Unavailable
      </h1>

      <p className="text-sm text-zinc-600 max-w-md mx-auto mb-8 leading-relaxed">
        The story you requested may have been relocated, updated by the DELSU editorial desk, or the URL might be mistyped.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Back to Homepage</span>
        </Link>
        <Link
          href="/category/campus-updates"
          className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl transition-colors border border-zinc-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Campus Updates</span>
        </Link>
      </div>
    </div>
  );
}
