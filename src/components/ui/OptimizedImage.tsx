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
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className = '',
  priority = false,
}: OptimizedImageProps) {
  const { isLiteMode } = useLiteMode();
  const [forceShow, setForceShow] = useState(false);
  const [hasError, setHasError] = useState(false);

  // If Lite Mode is ON and user hasn't explicitly clicked to view this single image:
  if (isLiteMode && !forceShow) {
    return (
      <div
        className={`bg-zinc-100 border border-dashed border-red-200 flex flex-col items-center justify-center p-4 text-center select-none ${
          fill ? 'absolute inset-0 w-full h-full' : 'w-full min-h-[160px]'
        } ${className}`}
      >
        <ImageOff className="w-6 h-6 text-red-500 mb-1" />
        <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
          Lite Mode Active
        </span>
        <p className="text-[11px] text-zinc-500 max-w-[200px] line-clamp-1 mb-2">
          {alt || 'Image hidden to save mobile data'}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setForceShow(true);
          }}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 transition-colors"
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
    </div>
  );
}

