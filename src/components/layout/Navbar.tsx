'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '@/data/categories';
import { SearchModal } from '@/components/ui/SearchModal';
import { Search, Menu, X, Shield, Radio } from 'lucide-react';

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-red-600 shadow-sm transition-all">
        {/* Brand Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & Brand Name */}
            <Link
              href="/"
              className="flex items-center gap-3 group shrink-0 py-1"
              title="Delsu Abraka Blog TV - Home"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-red-600 shadow-md group-hover:scale-105 transition-transform bg-white shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="Delsu Abraka Update Blog TV Logo"
                  fill
                  className="object-contain p-0.5"
                  priority
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950 font-sans uppercase">
                    DELSU <span className="text-red-600">ABRAKA</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black tracking-widest uppercase bg-red-600 text-white px-1.5 py-0.5 rounded">
                    <Radio className="w-2.5 h-2.5 animate-pulse text-white" /> TV
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-zinc-600 uppercase tracking-wider">
                  Update Blog & Digital Media
                </span>
                <span className="text-[9px] text-red-600 font-semibold tracking-normal hidden md:inline">
                  Delta State University • Abraka • Nigeria
                </span>
              </div>
            </Link>

            {/* Desktop Action Buttons: Search + Admin */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-red-50 hover:text-red-600 rounded-full border border-zinc-200 hover:border-red-300 transition-all shadow-inner"
                title="Search stories (Ctrl+K)"
              >
                <Search className="w-4 h-4 text-red-600" />
                <span className="hidden md:inline">Search DELSU & Naija news...</span>
                <kbd className="hidden lg:inline-block text-[10px] bg-white border border-zinc-300 text-zinc-400 px-1.5 py-0.5 rounded shadow-xs">
                  ⌘K
                </kbd>
              </button>

              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-zinc-900 text-white hover:bg-red-700 transition-colors shadow-sm"
                title="Staff & Editorial CMS Access"
              >
                <Shield className="w-3.5 h-3.5 text-red-400" />
                <span>Admin CMS</span>
              </Link>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 text-zinc-700 hover:text-red-600 hover:bg-zinc-100 rounded-lg"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-red-600" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Categories Bar (Desktop Navigation) */}
        <div className="hidden sm:block bg-zinc-50 border-t border-zinc-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-1 overflow-x-auto py-1.5 scrollbar-none text-xs font-bold">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors uppercase tracking-wide ${
                  pathname === '/'
                    ? 'bg-red-600 text-white font-extrabold shadow-sm'
                    : 'text-zinc-700 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                Home
              </Link>

              {CATEGORIES.map((cat) => {
                const isActive = pathname === `/category/${cat.slug}`;
                return (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors tracking-wide ${
                      isActive
                        ? 'bg-red-600 text-white font-extrabold shadow-sm'
                        : 'text-zinc-700 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {cat.shortName}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-t border-zinc-200 px-4 pt-3 pb-6 shadow-xl animate-fade-in">
            <div className="flex flex-col space-y-1">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-bold uppercase ${
                  pathname === '/'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-800 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                Home
              </Link>

              {CATEGORIES.map((cat) => {
                const isActive = pathname === `/category/${cat.slug}`;
                return (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-700 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">→</span>
                  </Link>
                );
              })}

              <div className="pt-4 mt-2 border-t border-zinc-200 flex flex-col gap-2">
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-900 text-white text-sm font-bold rounded-lg hover:bg-red-700"
                >
                  <Shield className="w-4 h-4 text-red-400" />
                  <span>Admin & Editorial CMS</span>
                </Link>

                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
                >
                  <span>Join WhatsApp Channel</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Global Search Dialog */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
