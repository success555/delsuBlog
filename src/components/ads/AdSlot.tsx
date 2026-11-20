'use client';

import React from 'react';
import { useLiteMode } from '@/context/LiteModeContext';

interface AdSlotProps {
  type: 'leaderboard' | 'sidebar' | 'in-article';
  className?: string;
  adText?: string;
  sponsorName?: string;
}

export function AdSlot({
  type,
  className = '',
  adText,
  sponsorName = 'Partner / AdSense Slot',
}: AdSlotProps) {
  const { isLiteMode } = useLiteMode();

  // If Lite Mode is ON, collapse heavy ad spaces into minimal one-line notice to save data
  if (isLiteMode) {
    return (
      <div className={`py-1 text-center border-y border-zinc-200 bg-zinc-50 ${className}`}>
        <span className="text-[10px] text-zinc-400 uppercase tracking-widest">
          [Lite Mode: Ad placeholder condensed to save bandwidth]
        </span>
      </div>
    );
  }

  if (type === 'leaderboard') {
    return (
      <div className={`w-full my-6 flex flex-col items-center ${className}`}>
        <div className="w-full max-w-[728px] min-h-[90px] bg-zinc-50 border border-dashed border-red-200 rounded-lg flex flex-col items-center justify-center p-3 text-center transition-all hover:border-red-400">
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
            Advertisement • 728 × 90 Leaderboard
          </span>
          <p className="text-xs font-semibold text-zinc-800">
            {adText || 'Promote Your Campus Brand, Product or Event on Delsu Abraka Blog TV'}
          </p>
          <span className="text-[11px] text-red-600 font-medium hover:underline cursor-pointer mt-0.5">
            Contact Ad Desk: advertise@delsublog.ng
          </span>
        </div>
      </div>
    );
  }

  if (type === 'sidebar') {
    return (
      <div className={`w-full my-4 flex flex-col items-center ${className}`}>
        <div className="w-full max-w-[300px] min-h-[250px] bg-zinc-50 border border-dashed border-red-200 rounded-xl flex flex-col items-center justify-center p-4 text-center transition-all hover:border-red-400">
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
            Sponsored • 300 × 250 Square
          </span>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-black text-sm mb-2">
            AD
          </div>
          <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 mb-1">
            {adText || 'Target 25,000+ DELSU Students and Nigerian Readers'}
          </h4>
          <p className="text-[11px] text-zinc-500 mb-3">
            {sponsorName}
          </p>
          <button
            type="button"
            className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors"
          >
            Advertise Here
          </button>
        </div>
      </div>
    );
  }

  // in-article banner
  return (
    <div className={`my-8 py-4 px-6 bg-red-50/50 border-l-4 border-red-600 rounded-r-lg ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 block mb-1">
            Sponsored Spotlight
          </span>
          <p className="text-sm font-bold text-zinc-900">
            {adText || 'Need Fast Off-Campus Accommodation in Abraka or Student Deals?'}
          </p>
          <p className="text-xs text-zinc-600 mt-0.5">
            Check verified student listings, verified hostels, and campus offers on our bulletin.
          </p>
        </div>
        <a
          href="https://whatsapp.com"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md transition-colors"
        >
          Learn More
        </a>
      </div>
    </div>
  );
}
