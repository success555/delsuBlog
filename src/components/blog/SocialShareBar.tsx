'use client';

import React, { useState } from 'react';
import { MessageCircle, Twitter, Facebook, Link2, Check, Share2 } from 'lucide-react';

interface SocialShareBarProps {
  title: string;
  slug: string;
}

export function SocialShareBar({ title, slug }: SocialShareBarProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/blog/${slug}`;
    }
    return `https://delsublog.ng/blog/${slug}`;
  };

  const handleCopyLink = async () => {
    try {
      const url = getUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const shareWhatsApp = () => {
    const url = getUrl();
    const text = encodeURIComponent(`*${title}*\n\nRead full story on Delsu Abraka Blog TV:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareTwitter = () => {
    const url = getUrl();
    const text = encodeURIComponent(`${title} via @DelsuAbrakaBlog`);
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`, '_blank');
  };

  const shareFacebook = () => {
    const url = getUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="py-4 my-6 border-y border-zinc-200 flex flex-wrap items-center justify-between gap-3">
      
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-700">
        <Share2 className="w-4 h-4 text-red-600" />
        <span>Share This Story:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* WhatsApp Share Button (Prominently styled in Nigerian emerald) */}
        <button
          type="button"
          onClick={shareWhatsApp}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
          title="Share to WhatsApp Status or Group"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>WhatsApp</span>
        </button>

        {/* X / Twitter */}
        <button
          type="button"
          onClick={shareTwitter}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition-colors shadow-sm"
          title="Post to X (Twitter)"
        >
          <Twitter className="w-3.5 h-3.5" />
          <span>X</span>
        </button>

        {/* Facebook */}
        <button
          type="button"
          onClick={shareFacebook}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm"
          title="Share to Facebook"
        >
          <Facebook className="w-3.5 h-3.5 fill-white" />
          <span>Facebook</span>
        </button>

        {/* Copy Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs border border-zinc-300 transition-colors"
          title="Copy link to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Link2 className="w-3.5 h-3.5 text-zinc-600" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
