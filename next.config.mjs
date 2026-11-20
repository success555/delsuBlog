// Safe atob guard at the absolute earliest point in the Node.js process lifecycle
if (typeof globalThis !== 'undefined' && typeof globalThis.atob === 'function') {
  const originalAtob = globalThis.atob;
  if (!globalThis.__safe_atob_installed__) {
    globalThis.__safe_atob_installed__ = true;
    globalThis.atob = function safeAtob(data) {
      try {
        if (typeof data !== 'string' || !data) {
          return '';
        }
        return originalAtob(data);
      } catch {
        return '';
      }
    };
  }
}

// Sanitize Clerk environment variables to prevent InvalidCharacterError in @clerk/shared during static generation
const clerkPub = (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '').trim().replace(/^["']|["']$/g, '');
if (clerkPub) {
  let isValid = false;
  if (clerkPub.startsWith('pk_test_') || clerkPub.startsWith('pk_live_')) {
    try {
      const parts = clerkPub.split('_');
      if (parts.length >= 3 && parts[2]) {
        const decoded = Buffer.from(parts[2], 'base64').toString('utf-8');
        if (decoded.endsWith('$') && decoded.length > 2) {
          isValid = true;
        }
      }
    } catch {
      isValid = false;
    }
  }
  if (!isValid) {
    console.warn('[next.config.mjs] Sanitized placeholder/malformed NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to prevent build failure.');
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = '';
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
