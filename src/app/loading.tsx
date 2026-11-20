import React from 'react';
import { Radio } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-3 bg-red-600 text-white rounded-2xl mb-4 shadow-lg shadow-red-950/20 animate-pulse">
        <Radio className="w-8 h-8 animate-spin" />
      </div>
      <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 font-sans">
        Delsu Abraka Blog TV
      </h3>
      <p className="text-xs text-zinc-400 mt-1 font-mono">
        Loading latest headlines in West Africa Time...
      </p>
    </div>
  );
}

