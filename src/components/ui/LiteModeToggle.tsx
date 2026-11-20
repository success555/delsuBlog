'use client';

import React from 'react';
import { useLiteMode } from '@/context/LiteModeContext';
import { Zap, ZapOff } from 'lucide-react';

export function LiteModeToggle() {
  const { isLiteMode, toggleLiteMode } = useLiteMode();

  return (
    <button
      onClick={toggleLiteMode}
      type="button"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all shadow-sm ${
        isLiteMode
          ? 'bg-amber-400 text-black border border-amber-500 shadow-amber-900/20'
          : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white border border-zinc-700'
      }`}
      title={
        isLiteMode
          ? 'Lite Mode active: High-resolution media hidden to conserve data'
          : 'Enable Lite Mode (Data Saver) for low-bandwidth browsing'
      }
    >
      {isLiteMode ? (
        <>
          <Zap className="w-3.5 h-3.5 fill-black text-black" />
          <span>Lite Mode: ON</span>
          <span className="hidden sm:inline-block text-[10px] bg-black/15 px-1 rounded uppercase tracking-wider">
            Save 80%
          </span>
        </>
      ) : (
        <>
          <ZapOff className="w-3.5 h-3.5 text-red-400" />
          <span>Data Saver</span>
        </>
      )}
    </button>
  );
}
