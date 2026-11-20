'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLiteMode } from '@/context/LiteModeContext';
import { getAdBySlot } from '@/lib/adsStore';
import { Advertisement, AdSlotType } from '@/types/ads';
import { ExternalLink } from 'lucide-react';

interface AdSlotProps {
  type: AdSlotType;
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
  const [ad, setAd] = useState<Advertisement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAd = async () => {
      const data = await getAdBySlot(type);
      if (isMounted) {
        setAd(data);
      }
    };

    fetchAd();

    const handleAdUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<Advertisement>;
      if (customEvent.detail && customEvent.detail.slot === type) {
        setAd(customEvent.detail);
      } else {
        fetchAd();
      }
    };

    window.addEventListener('delsu_ads_updated', handleAdUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('delsu_ads_updated', handleAdUpdated);
    };
  }, [type]);

  // If Lite Mode is ON, collapse heavy ad spaces into minimal one-line notice to save data
  if (isLiteMode) {
    return (
      <div className={`py-1 text-center border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 ${className}`}>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
          [Lite Mode: Ad placeholder condensed to save bandwidth]
        </span>
      </div>
    );
  }

  // 1. ACTIVE CUSTOM UPLOADED AD
  if (ad && ad.is_active && ad.image_url) {
    if (type === 'leaderboard') {
      return (
        <div className={`w-full my-6 flex flex-col items-center ${className}`}>
          <a
            href={ad.target_url || 'https://wa.me/message/J3ZOIRSKCSMZM1'}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full max-w-[728px] aspect-[728/90] sm:aspect-[728/90] rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm hover:shadow-md hover:border-red-400 transition-all block"
            title={`${ad.title} (${ad.sponsor_name})`}
          >
            <Image
              src={ad.image_url}
              alt={ad.title || 'DELSU Advertisement'}
              fill
              unoptimized
              className="object-cover group-hover:scale-[1.01] transition-transform duration-300"
            />
            <div className="absolute top-1.5 right-1.5 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-xs">
              <span>AD</span>
              <ExternalLink className="w-2.5 h-2.5 text-red-400" />
            </div>
            {ad.sponsor_name && (
              <div className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded backdrop-blur-xs">
                Sponsored by {ad.sponsor_name}
              </div>
            )}
          </a>
        </div>
      );
    }

    if (type === 'sidebar') {
      return (
        <div className={`w-full my-4 flex flex-col items-center ${className}`}>
          <a
            href={ad.target_url || 'https://wa.me/message/J3ZOIRSKCSMZM1'}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full max-w-[300px] aspect-[300/250] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm hover:shadow-md hover:border-red-400 transition-all block"
            title={`${ad.title} (${ad.sponsor_name})`}
          >
            <Image
              src={ad.image_url}
              alt={ad.title || 'DELSU Advertisement'}
              fill
              unoptimized
              className="object-cover group-hover:scale-[1.01] transition-transform duration-300"
            />
            <div className="absolute top-2 right-2 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-xs">
              <span>SPONSORED</span>
              <ExternalLink className="w-2.5 h-2.5 text-red-400" />
            </div>
            {ad.sponsor_name && (
              <div className="absolute bottom-2 left-2 right-2 bg-black/75 text-white text-[10px] px-2 py-1 rounded backdrop-blur-xs truncate">
                {ad.sponsor_name}
              </div>
            )}
          </a>
        </div>
      );
    }

    // in-article banner
    return (
      <div className={`my-8 ${className}`}>
        <a
          href={ad.target_url || 'https://wa.me/message/J3ZOIRSKCSMZM1'}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-full aspect-[21/9] sm:aspect-[4/1] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm hover:shadow-md hover:border-red-400 transition-all block"
          title={`${ad.title} (${ad.sponsor_name})`}
        >
          <Image
            src={ad.image_url}
            alt={ad.title || 'DELSU Advertisement'}
            fill
            unoptimized
            className="object-cover group-hover:scale-[1.01] transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 bg-black/75 text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-xs">
            <span>SPONSORED</span>
            <ExternalLink className="w-2.5 h-2.5 text-red-400" />
          </div>
          {ad.sponsor_name && (
            <div className="absolute bottom-2 left-2 bg-black/75 text-white text-[10px] px-2.5 py-0.5 rounded backdrop-blur-xs">
              {ad.sponsor_name}
            </div>
          )}
        </a>
      </div>
    );
  }

  // 2. DEFAULT FALLBACK PLACEHOLDERS (When no active custom ad image is configured)
  if (type === 'leaderboard') {
    return (
      <div className={`w-full my-6 flex flex-col items-center ${className}`}>
        <div className="w-full max-w-[728px] min-h-[90px] bg-zinc-50 dark:bg-zinc-900 border border-dashed border-red-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center p-3 text-center transition-all hover:border-red-400 dark:hover:border-red-500">
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
            Advertisement • 728 × 90 Leaderboard
          </span>
          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            {adText || 'Promote Your Campus Brand, Product or Event on Delsu Abraka Blog TV'}
          </p>
          <a
            href="mailto:advertise@delsublog.ng?subject=Advertising Inquiry on DELSU Abraka Blog Leaderboard"
            className="text-[11px] text-red-600 dark:text-red-400 font-medium hover:underline cursor-pointer mt-0.5 inline-flex items-center gap-1"
          >
            <span>Contact Ad Desk: advertise@delsublog.ng</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  if (type === 'sidebar') {
    return (
      <div className={`w-full my-4 flex flex-col items-center ${className}`}>
        <div className="w-full max-w-[300px] min-h-[250px] bg-zinc-50 dark:bg-zinc-900 border border-dashed border-red-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center p-4 text-center transition-all hover:border-red-400 dark:hover:border-red-500">
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
            Sponsored • 300 × 250 Square
          </span>
          <div className="w-12 h-12 bg-red-100 dark:bg-red-950/60 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 font-black text-sm mb-2">
            AD
          </div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-1">
            {adText || 'Target 25,000+ DELSU Students and Nigerian Readers'}
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3">
            {sponsorName}
          </p>
          <a
            href="mailto:advertise@delsublog.ng?subject=Advertising Inquiry on DELSU Abraka Blog Sidebar"
            className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors inline-flex items-center gap-1"
          >
            <span>Advertise Here</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  // in-article banner fallback
  return (
    <div className={`my-8 py-4 px-6 bg-red-50/50 dark:bg-zinc-900 border-l-4 border-red-600 rounded-r-lg transition-colors ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 block mb-1">
            Sponsored Spotlight
          </span>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {adText || 'Need Fast Off-Campus Accommodation in Abraka or Student Deals?'}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Check verified student listings, verified hostels, and campus offers on our bulletin.
          </p>
        </div>
        <a
          href="mailto:advertise@delsublog.ng?subject=Sponsored Spotlight Inquiry on DELSU Abraka Blog"
          className="shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md transition-colors inline-flex items-center gap-1"
        >
          <span>Contact Desk</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
