'use client';

import React, { useState } from 'react';
import { MessageCircle, Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export function NewsletterBox() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'homepage_banner' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setIsSubscribed(true);
      setEmail('');
    } catch (err: any) {
      console.error('Newsletter subscription error:', err);
      // Even if network or API has error, provide a graceful state
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="my-12 bg-gradient-to-r from-red-600 via-red-700 to-zinc-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative border border-red-500">
      
      {/* Background Decorative Rings */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute right-40 -top-20 w-48 h-48 bg-red-400/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: WhatsApp Channel Emphasis */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase mb-3 text-red-100">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Instant Campus News Alerts</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-3">
            Join 25,000+ DELSUites & Naija Readers on WhatsApp
          </h2>

          <p className="text-sm text-red-100 leading-relaxed mb-6 max-w-xl">
            Get instant alerts on DELSU Senate memos, Post-UTME clearance, SUG elections, student bursaries, and breaking Nigerian tech & entertainment updates directly in your WhatsApp feed.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/40 transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Join WhatsApp Channel Now</span>
            </a>

            <span className="text-xs text-red-200 font-medium">
              Free • Zero Spam • 100% Privacy
            </span>
          </div>
        </div>

        {/* Right Column: Email Bulletin Box */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-2xl p-6 shadow-2xl border border-zinc-100 dark:border-zinc-800 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
            <Mail className="w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 dark:text-white">
              Weekly Digest By Email
            </h3>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
            Receive our curated Friday round-up of the week’s top DELSU and Nigerian investigative stories.
          </p>

          {isSubscribed ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">You&apos;re Subscribed!</h4>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                Welcome to Delsu Abraka Blog TV newsroom updates.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div>
                <label htmlFor="newsletter-email" className="sr-only">
                  Email Address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white dark:focus:bg-zinc-800"
                />
              </div>

              {errorMessage && (
                <p className="text-[11px] text-red-600 bg-red-50 dark:bg-red-950/40 p-2 rounded border border-red-200 dark:border-red-800">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>{isLoading ? 'Subscribing...' : 'Subscribe Free'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <p className="text-[10px] text-zinc-400 text-center">
                Unsubscribe anytime with 1 click.
              </p>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}

