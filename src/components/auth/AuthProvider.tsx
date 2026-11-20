'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkReady = Boolean(
  publishableKey &&
    publishableKey.startsWith('pk_') &&
    !publishableKey.includes('placeholder')
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!isClerkReady) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}

