'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface LiteModeContextType {
  isLiteMode: boolean;
  toggleLiteMode: () => void;
  setLiteMode: (enabled: boolean) => void;
}

const LiteModeContext = createContext<LiteModeContextType>({
  isLiteMode: false,
  toggleLiteMode: () => {},
  setLiteMode: () => {},
});

const LITE_MODE_STORAGE_KEY = 'delsu_blog_lite_mode';

export function LiteModeProvider({ children }: { children: React.ReactNode }) {
  const [isLiteMode, setIsLiteMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(LITE_MODE_STORAGE_KEY);
      if (saved !== null) {
        setIsLiteMode(saved === 'true');
      }
    } catch {
      // Ignore local storage errors
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(LITE_MODE_STORAGE_KEY, String(isLiteMode));
      if (isLiteMode) {
        document.documentElement.classList.add('lite-mode');
      } else {
        document.documentElement.classList.remove('lite-mode');
      }
    } catch {
      // Ignore
    }
  }, [isLiteMode, mounted]);

  const toggleLiteMode = () => {
    setIsLiteMode((prev) => !prev);
  };

  const setLiteMode = (enabled: boolean) => {
    setIsLiteMode(enabled);
  };

  return (
    <LiteModeContext.Provider value={{ isLiteMode, toggleLiteMode, setLiteMode }}>
      {children}
    </LiteModeContext.Provider>
  );
}

export function useLiteMode() {
  return useContext(LiteModeContext);
}
