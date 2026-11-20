'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export function WatClock() {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Africa/Lagos',
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        setTimeString(formatter.format(now));
      } catch {
        setTimeString(new Date().toLocaleTimeString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeString) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-mono">
        <Clock className="w-3.5 h-3.5 text-red-400 animate-spin" />
        <span>WAT Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-200 font-mono">
      <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
      <span className="font-semibold text-white">WAT:</span>
      <span className="tracking-tight">{timeString}</span>
    </div>
  );
}

