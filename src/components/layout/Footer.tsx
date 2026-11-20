import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CATEGORIES } from '@/data/categories';
import { MessageCircle, Twitter, Facebook, Youtube, Shield, MapPin, Mail, Radio } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t-4 border-red-600 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-zinc-800">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-red-600 bg-white shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="Delsu Abraka Update Blog TV"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white uppercase font-sans">
                  DELSU <span className="text-red-500">ABRAKA</span>
                </span>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Update Blog TV
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Delta State University (Abraka) premier independent digital media outlet. Bringing you verified campus Senate updates, admissions gist, student lifestyle, and premier Nigerian news across tech, entertainment, business, and sports.
            </p>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <span>Abraka Campus, Delta State, Nigeria</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Mail className="w-4 h-4 text-red-500 shrink-0" />
              <span>newsdesk@delsublog.ng</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white border-l-2 border-red-500 pl-2 mb-4">
              Editorial Categories
            </h3>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hover:text-red-400 transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-red-500">›</span>
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Campus Life & Resources */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white border-l-2 border-red-500 pl-2 mb-4">
              DELSU Student Hub
            </h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/category/campus-updates" className="hover:text-red-400 transition-colors">
                  Senate & Academic Timetables
                </Link>
              </li>
              <li>
                <Link href="/category/campus-updates" className="hover:text-red-400 transition-colors">
                  Post-UTME & Direct Entry News
                </Link>
              </li>
              <li>
                <Link href="/category/campus-updates" className="hover:text-red-400 transition-colors">
                  Student Union Government (SUG)
                </Link>
              </li>
              <li>
                <Link href="/category/japa-diaspora" className="hover:text-red-400 transition-colors">
                  Scholarships & Japa Opportunities
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-red-400 transition-colors flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-red-500" />
                  <span>Editorial Staff CMS Login</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect & WhatsApp Community */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-white border-l-2 border-red-500 pl-2">
              Join Our Community
            </h3>
            <p className="text-xs text-zinc-400">
              Never miss breaking news from Abraka and across Nigeria. Join over 25,000 students and alumni on our WhatsApp channel.
            </p>

            <a
              href="https://whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Join WhatsApp Channel</span>
            </a>

            <div className="pt-2">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold block mb-2">
                Follow Delsu Abraka Blog TV
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-zinc-900 hover:bg-red-600 text-zinc-300 hover:text-white rounded-md transition-colors"
                  aria-label="Follow us on X (Twitter)"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-zinc-900 hover:bg-red-600 text-zinc-300 hover:text-white rounded-md transition-colors"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-zinc-900 hover:bg-red-600 text-zinc-300 hover:text-white rounded-md transition-colors"
                  aria-label="Subscribe to our YouTube TV channel"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-red-500" />
            <span>&copy; {new Date().getFullYear()} Delsu Abraka Update Blog TV. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/" className="hover:text-zinc-300">Privacy Policy</Link>
            <span>•</span>
            <Link href="/" className="hover:text-zinc-300">Terms of Service</Link>
            <span>•</span>
            <Link href="/admin" className="text-red-400 hover:text-red-300 font-semibold">CMS Portal</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

