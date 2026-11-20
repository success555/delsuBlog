import React from 'react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { ShieldCheck, Award } from 'lucide-react';

interface AuthorBioProps {
  name: string;
  avatar: string;
  role: string;
}

export function AuthorBio({ name, avatar, role }: AuthorBioProps) {
  return (
    <div className="my-10 p-5 sm:p-6 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-red-500 shadow-md shrink-0 bg-white">
        <OptimizedImage
          src={avatar}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 justify-center sm:justify-start">
          <h3 className="text-base font-black text-zinc-950 font-sans">
            {name}
          </h3>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full w-fit mx-auto sm:mx-0">
            <ShieldCheck className="w-3 h-3 text-red-600" />
            Verified Staff
          </span>
        </div>

        <p className="text-xs font-bold text-red-600 mb-2">
          {role}
        </p>

        <p className="text-xs text-zinc-600 leading-relaxed">
          Reporting from the heart of Delta State University, Abraka campus and covering national affairs, tech disruptions, and youth trends across the Niger Delta and Nigeria.
        </p>

        <div className="mt-3 pt-3 border-t border-zinc-200/80 flex items-center justify-center sm:justify-start gap-3 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            DELSU Press Council Accredited
          </span>
        </div>
      </div>
    </div>
  );
}
