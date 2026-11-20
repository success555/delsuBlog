'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface DarkModeToggleProps {
  variant?: 'header' | 'navbar' | 'mobile';
  className?: string;
}

export function DarkModeToggle({
  variant = 'header',
  className = '',
}: DarkModeToggleProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render placeholder to avoid layout shift during hydration
    return (
      <div
        className={`w-7 h-7 rounded-full bg-zinc-800/40 animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'header') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
          isDarkMode
            ? 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-400/40'
            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
        } ${className}`}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <>
            <Sun className="w-3 h-3 text-amber-400" />
            <span className="hidden md:inline">Light</span>
          </>
        ) : (
          <>
            <Moon className="w-3 h-3 text-zinc-400" />
            <span className="hidden md:inline">Dark</span>
          </>
        )}
      </button>
    );
  }

  if (variant === 'mobile') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          isDarkMode
            ? 'bg-zinc-800 text-amber-300 hover:bg-zinc-700'
            : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
        } ${className}`}
      >
        <span className="flex items-center gap-2">
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-600" />
          )}
          <span>{isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
        </span>
        <span className="text-xs font-mono uppercase text-zinc-400">
          {isDarkMode ? 'Dark ON' : 'Light ON'}
        </span>
      </button>
    );
  }

  // Default navbar icon button
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors ${
        isDarkMode
          ? 'text-amber-400 hover:bg-zinc-800 hover:text-amber-300'
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
      } ${className}`}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
