'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface StaffAvatarProps {
  name: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function StaffAvatar({
  name,
  avatar,
  size = 'md',
  className = '',
}: StaffAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg',
  };

  const imageSizes = {
    sm: 28,
    md: 36,
    lg: 64,
    xl: 80,
  };

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  const isValidAvatar = Boolean(avatar && avatar.trim() && !hasError);

  return (
    <div
      className={`relative rounded-full overflow-hidden border-2 border-red-600 bg-red-100 shrink-0 flex items-center justify-center select-none shadow-xs ${sizeClasses[size]} ${className}`}
    >
      {isValidAvatar ? (
        <Image
          src={avatar!}
          alt={name}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="object-cover w-full h-full"
          onError={() => setHasError(true)}
          unoptimized
        />
      ) : (
        <span className="font-black text-red-700 uppercase tracking-tight">
          {initials || 'DB'}
        </span>
      )}
    </div>
  );
}

