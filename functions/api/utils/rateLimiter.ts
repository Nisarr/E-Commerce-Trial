// ── Rate Limiter (In-Memory) ────────────────────────────
// Simple per-IP rate limiter for Cloudflare Pages Functions.
// Uses a Map with TTL-based cleanup. Works for single-instance
// dev and low-traffic production. For high-traffic, upgrade to
// Cloudflare KV or Durable Objects.

interface RateEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateEntry>();

// Clean up stale entries every 60 seconds
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitMap) {
    if (entry.resetAt < now) rateLimitMap.delete(key);
  }
}

/**
 * Check if a request should be rate-limited.
 * @param key   Unique identifier (e.g., IP + path)
 * @param limit Max requests allowed in the window
 * @param windowMs  Time window in milliseconds
 * @returns { limited: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60_000
): { limited: boolean; remaining: number; resetAt: number } {
  cleanup();

  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count++;
  if (entry.count > limit) {
    return { limited: true, remaining: 0, resetAt: entry.resetAt };
  }

  return { limited: false, remaining: limit - entry.count, resetAt: entry.resetAt };
}
