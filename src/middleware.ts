import '@/lib/safeAtob';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isValidClerkPublishableKey, isValidClerkSecretKey } from '@/lib/clerkUtils';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
const secretKey = process.env.CLERK_SECRET_KEY?.trim();

const isClerkConfigured = Boolean(
  isValidClerkPublishableKey(publishableKey) &&
  isValidClerkSecretKey(secretKey)
);

export default function middleware(req: NextRequest) {
  // If Clerk is configured with valid keys, invoke Clerk middleware
  if (isClerkConfigured) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { clerkMiddleware, createRouteMatcher } = require('@clerk/nextjs/server');
      const isProtectedRoute = createRouteMatcher(['/admin(.*)']);
      const handler = clerkMiddleware((auth: any, request: any) => {
        if (isProtectedRoute(request)) {
          auth().protect();
        }
      });
      return handler(req, {} as any);
    } catch (e) {
      console.warn('Clerk middleware error, passing request through:', e);
    }
  }

  // If Clerk is not configured, allow request through (admin protected by local session)
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
