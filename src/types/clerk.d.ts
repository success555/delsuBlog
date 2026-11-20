declare module '@clerk/nextjs' {
  import React from 'react';
  export const ClerkProvider: React.ComponentType<{
    publishableKey?: string;
    children: React.ReactNode;
    [key: string]: any;
  }>;
  export const SignedIn: React.ComponentType<{ children: React.ReactNode }>;
  export const SignedOut: React.ComponentType<{ children: React.ReactNode }>;
  export const SignInButton: React.ComponentType<{
    mode?: 'modal' | 'redirect';
    children: React.ReactNode;
    [key: string]: any;
  }>;
  export const UserButton: React.ComponentType<{
    afterSignOutUrl?: string;
    appearance?: any;
    [key: string]: any;
  }>;
  export const useUser: () => {
    user: any;
    isSignedIn: boolean;
    isLoaded: boolean;
  };
  export const useAuth: () => {
    userId: string | null;
    sessionId: string | null;
    getToken: (options?: any) => Promise<string | null>;
  };
}

declare module '@clerk/nextjs/server' {
  import { NextRequest, NextResponse } from 'next/server';
  export function clerkMiddleware(
    handler?: (auth: any, req: NextRequest) => any
  ): (req: NextRequest, event: any) => Promise<NextResponse | void>;
  export function createRouteMatcher(patterns: string[]): (req: NextRequest) => boolean;
  export function auth(): {
    userId: string | null;
    sessionId: string | null;
    getToken: (options?: any) => Promise<string | null>;
    protect: () => void;
  };
  export function currentUser(): Promise<any>;
  export type WebhookEvent = {
    data: any;
    object: string;
    type: string;
  };
}
