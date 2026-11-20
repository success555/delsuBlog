'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WatClock } from '@/components/ui/WatClock';
import { LiteModeToggle } from '@/components/ui/LiteModeToggle';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { Flame, ChevronRight, MessageCircle } from 'lucide-react';

const BREAKING_HEADLINES = [
  {
    id: 1,
    title: 'DELSU Senate approves 2026/2027 academic session calendar; Abraka Site III opens modern digital hub.',
    slug: 'delsu-senate-approves-revised-academic-calendar-site-iii-digital-hub',
  },
  {
    id: 2,
    title: 'Super Eagles crush rivals 3-0 in electrifying AFCON qualifier as Osimhen & Lookman score.',
    slug: 'super-eagles-deliver-scintillating-3-0-win-in-afcon-qualifiers',
  },
  {
    id: 3,
    title: 'Burna Boy and Asake cross 5 billion streams as Afrobeats dominates worldwide charts.',
    slug: 'burna-boy-asake-dominate-global-billboard-as-afrobeats-hits-record-streams',
  },
  {
    id: 4,
    title: 'Lagos Fintechs roll out zero-fee student remittances and campus virtual accounts.',
    slug: 'lagos-fintech-giants-expand-student-wallets-cross-border-settlement',
  },
];

export function Header() {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % BREAKING_HEADLINES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const activeNews = BREAKING_HEADLINES[currentNewsIndex];

  return (
    <header className="w-full bg-[#111827] text-white border-b border-red-900/40 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-2 gap-2 sm:gap-4">
          
          {/* Breaking News Ticker */}
          <div className="flex items-center w-full sm:w-auto flex-1 overflow-hidden min-w-0">
            <div className="flex items-center gap-1.5 bg-red-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded tracking-wide uppercase shrink-0 shadow-sm shadow-red-900/50">
              <Flame className="w-3.5 h-3.5 fill-white animate-pulse" />
              <span>Breaking</span>
            </div>
            
            <div className="ml-2.5 overflow-hidden whitespace-nowrap text-zinc-200 text-xs flex-1">
              <Link
                href={`/blog/${activeNews.slug}`}
                className="hover:text-red-400 transition-colors inline-flex items-center gap-1 truncate"
              >
                <span className="font-medium truncate">{activeNews.title}</span>
                <ChevronRight className="w-3 h-3 text-red-500 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Right Controls: WAT Clock + WhatsApp Channel CTA + Lite Mode Toggle */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
            <WatClock />
            
            <a
              href="https://wa.me/message/J3ZOIRSKCSMZM1"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              title="Join DELSU Abraka WhatsApp Group"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Group</span>
            </a>

            <div className="h-3.5 w-px bg-zinc-700 hidden sm:block" />

            <DarkModeToggle variant="header" />

            <LiteModeToggle />
          </div>

        </div>
      </div>
    </header>
  );
}

