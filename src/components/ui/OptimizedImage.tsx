'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLiteMode } from '@/context/LiteModeContext';
import { ImageOff, Eye } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  aspectRatio?: string;
  hideLogo?: boolean;
  logoPosition?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';
  logoSize?: 'standard' | 'compact' | 'badge';
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className = '',
  priority = false,
  hideLogo = false,
  logoPosition = 'bottom-right',
  logoSize = 'standard',
}: OptimizedImageProps) {
  const { isLiteMode } = useLiteMode();
  const [forceShow, setForceShow] = useState(false);
  const [hasError, setHasError] = useState(false);

  // If Lite Mode is ON and user hasn't explicitly clicked to view this single image:
  if (isLiteMode && !forceShow) {
    return (
      <div
        className={`bg-zinc-100 dark:bg-zinc-900 border border-dashed border-red-200 dark:border-zinc-800 flex flex-col items-center justify-center p-4 text-center select-none ${
          fill ? 'absolute inset-0 w-full h-full' : 'w-full min-h-[160px]'
        } ${className}`}
      >
        <ImageOff className="w-6 h-6 text-red-500 mb-1" />
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Lite Mode Active
        </span>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-[200px] line-clamp-1 mb-2">
          {alt || 'Image hidden to save mobile data'}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setForceShow(true);
          }}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-zinc-800 px-2 py-0.5 rounded border border-red-200 dark:border-zinc-700 transition-colors"
        >
          <Eye className="w-3 h-3" />
          Load this image
        </button>
      </div>
    );
  }

  // Safe fallback if the image URL fails to load
  const fallbackSrc =
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80';

  const cleanSrc = typeof src === 'string' && src.trim() !== '' ? src.trim() : fallbackSrc;
  const effectiveSrc = hasError ? fallbackSrc : cleanSrc;

  const positionClasses = {
    'bottom-right': 'bottom-2 right-2 sm:bottom-2.5 sm:right-2.5',
    'bottom-left': 'bottom-2 left-2 sm:bottom-2.5 sm:left-2.5',
    'top-right': 'top-2 right-2 sm:top-2.5 sm:right-2.5',
    'top-left': 'top-2 left-2 sm:top-2.5 sm:left-2.5',
  }[logoPosition] || 'bottom-2 right-2 sm:bottom-2.5 sm:right-2.5';

  const renderWatermark = () => {
    if (hideLogo) return null;

    return (
      <div
        className={`absolute ${positionClasses} z-10 pointer-events-none select-none transition-transform duration-300 group-hover:scale-105`}
        aria-hidden="true"
      >
        <div
          className={`flex items-center gap-1.5 bg-black/75 backdrop-blur-md rounded-full border border-white/25 shadow-lg ${
            logoSize === 'badge'
              ? 'pl-1.5 pr-3 py-1'
              : logoSize === 'compact'
              ? 'p-0.5'
              : 'pl-1 pr-2 py-0.5'
          }`}
        >
          <div
            className={`relative rounded-full overflow-hidden bg-white shrink-0 border border-red-600 shadow-xs ${
              logoSize === 'badge'
                ? 'w-6 h-6 sm:w-7 sm:h-7'
                : 'w-4 h-4 sm:w-5 sm:h-5'
            }`}
          >
            <Image
              src="/logo.jpg"
              alt="DELSU Abraka Blog TV"
              fill
              className="object-contain p-0.5"
              unoptimized
            />
          </div>
          {logoSize !== 'compact' && (
            <span
              className={`font-black uppercase tracking-wider text-white font-sans drop-shadow-sm whitespace-nowrap ${
                logoSize === 'badge'
                  ? 'text-[10px] sm:text-[11px]'
                  : 'text-[8px] sm:text-[9px]'
              }`}
            >
              {logoSize === 'badge' ? 'DELSU ABRAKA BLOG TV' : 'DELSU TV'}
            </span>
          )}
        </div>
      </div>
    );
  };

  if (fill) {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <Image
          src={effectiveSrc}
          alt={alt || 'Delsu Abraka Blog'}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover w-full h-full transition-transform duration-300 group-hover:scale-105 ${className}`}
          onError={() => setHasError(true)}
          unoptimized
        />
        {renderWatermark()}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={effectiveSrc}
        alt={alt || 'Delsu Abraka Blog'}
        width={width || 800}
        height={height || 500}
        priority={priority}
        className="object-cover w-full h-auto transition-transform duration-300 group-hover:scale-105"
        onError={() => setHasError(true)}
        unoptimized
      />
      {renderWatermark()}
    </div>
  );
}

