'use client';

import '@/lib/safeAtob';
import React, { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Shield, ArrowRight, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    const token = localStorage.getItem('delsu_admin_session');
    if (token === 'authenticated') {
      router.push('/admin');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Default master password or env
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'delsu2026';

    setTimeout(() => {
      if (password === validPassword || password === 'delsu2026') {
        localStorage.setItem('delsu_admin_session', 'authenticated');
        router.push('/admin');
      } else {
        setError('Incorrect passcode. Please check with DELSU Editorial Desk.');
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border-2 border-red-600 p-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-red-600 bg-white mb-4 shadow-md">
            <Image
              src="/logo.jpg"
              alt="Delsu Abraka Update Blog TV"
              fill
              className="object-contain p-1"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-red-600" />
            <span>Staff Editorial Access</span>
          </div>

          <h1 className="text-2xl font-black text-zinc-950 uppercase tracking-tight">
            DELSU CMS Portal
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Enter authorized passcode to manage campus news and articles
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Admin Passcode
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter passcode (default: delsu2026)"
                className="w-full px-4 py-3 pl-10 text-sm bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all"
              />
              <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-red-950/20 flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Verifying...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-4 text-center border-t border-zinc-100">
            <span className="text-[11px] text-zinc-400">
              Passcode for local preview: <code className="bg-zinc-100 text-red-700 px-1.5 py-0.5 rounded font-bold font-mono">delsu2026</code>
            </span>
          </div>
        </form>

      </div>
    </div>
  );
}

