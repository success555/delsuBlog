'use client';

import '@/lib/safeAtob';
import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { isValidClerkPublishableKey } from '@/lib/clerkUtils';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
const isClerkReady = isValidClerkPublishableKey(publishableKey);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!isClerkReady || !publishableKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}

