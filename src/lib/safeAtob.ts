/**
 * Safe atob polyfill/guard for Node.js serverless runtimes.
 * Prevents unhandled InvalidCharacterError when third-party libraries (such as @clerk/shared)
 * invoke atob() on malformed, placeholder, or non-base64 environment variables during
 * static page generation and serverless execution.
 */

if (typeof globalThis !== 'undefined' && typeof globalThis.atob === 'function') {
  const originalAtob = globalThis.atob;
  // @ts-ignore
  if (!globalThis.__safe_atob_installed__) {
    // @ts-ignore
    globalThis.__safe_atob_installed__ = true;
    globalThis.atob = function safeAtob(data: any): string {
      try {
        if (typeof data !== 'string' || !data) {
          return '';
        }
        return originalAtob(data);
      } catch {
        // Return empty string on malformed/invalid base64
        return '';
      }
    };
  }
}

export {};
