/**
 * Safe Clerk Key Validation
 * Ensures ClerkProvider or clerkMiddleware is only activated when
 * a genuinely valid Clerk Publishable Key (proper base64 ending with '$') is present.
 * Prevents InvalidCharacterError crashes during Vercel builds when placeholders or partial keys exist.
 */

export function isValidClerkPublishableKey(key?: string | null): boolean {
  if (!key || typeof key !== 'string') return false;

  const clean = key.trim().replace(/^["']|["']$/g, '');
  if (!clean.startsWith('pk_test_') && !clean.startsWith('pk_live_')) return false;
  if (clean.includes('placeholder') || clean.includes('...') || clean.includes('<')) return false;

  try {
    const parts = clean.split('_');
    if (parts.length < 3 || !parts[2]) return false;
    // Clerk publishable keys encode the frontend API host ending with '$'
    const decoded = Buffer.from(parts[2], 'base64').toString('utf-8');
    return decoded.endsWith('$');
  } catch {
    return false;
  }
}

export function isValidClerkSecretKey(key?: string | null): boolean {
  if (!key || typeof key !== 'string') return false;

  const clean = key.trim().replace(/^["']|["']$/g, '');
  if (!clean.startsWith('sk_test_') && !clean.startsWith('sk_live_')) return false;
  if (clean.includes('placeholder') || clean.includes('...') || clean.includes('<')) return false;

  return clean.length >= 25;
}
