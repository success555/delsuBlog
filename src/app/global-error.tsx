'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function RootGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Global Root Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-6 bg-zinc-950 text-white font-sans">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 bg-red-950 text-red-500 rounded-xl flex items-center justify-center mx-auto text-xl font-black">
            !
          </div>
          <h2 className="text-lg font-black uppercase tracking-tight text-white">
            Application Error
          </h2>
          <p className="text-xs text-zinc-400">
            {error?.message || 'A root layout error occurred. Please refresh or return to the homepage.'}
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Refresh
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
