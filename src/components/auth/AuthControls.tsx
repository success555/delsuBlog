'use client';

import '@/lib/safeAtob';
import React from 'react';
import Link from 'next/link';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/nextjs';
import { ShieldCheck, User } from 'lucide-react';
import { isValidClerkPublishableKey } from '@/lib/clerkUtils';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
const isClerkReady = isValidClerkPublishableKey(publishableKey);

export function AuthControls() {
  // If Clerk is not yet configured, render a link to the admin passcode CMS
  if (!isClerkReady) {
    return (
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-zinc-900 hover:bg-red-600 rounded-full transition-colors shadow-xs"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
        <span>Admin CMS</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <SignedIn>
        <Link
          href="/admin"
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-zinc-700 hover:text-red-600 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
          <span>Editor Desk</span>
        </Link>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'w-7 h-7 border border-red-200',
            },
          }}
        />
      </SignedIn>

      <SignedOut>
        <SignInButton mode="modal">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-zinc-900 hover:bg-red-600 rounded-full transition-colors shadow-xs"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </SignInButton>
      </SignedOut>
    </div>
  );
}

