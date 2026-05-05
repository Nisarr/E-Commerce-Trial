/**
 * Lightweight API Response Cache & Request Deduplication
 * 
 * Features:
 * - TTL-based cache for GET requests (default 30s)
 * - In-flight request deduplication (concurrent identical GETs return same promise)
 * - Automatic invalidation on mutating requests (POST/PATCH/DELETE)
 * - Manual invalidation via `invalidate(pattern)` 
 */

interface CacheEntry {
  data: any;
  expiry: number;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<any>>();

const DEFAULT_TTL_MS = 30_000; // 30 seconds

/**
 * Get a cached response if it exists and hasn't expired.
 */
export function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Store a response in the cache.
 */
export function setCache(key: string, data: any, ttlMs: number = DEFAULT_TTL_MS): void {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

/**
 * Get an in-flight promise for deduplication.
 */
export function getInflight(key: string): Promise<any> | null {
  return inflight.get(key) || null;
}

/**
 * Register an in-flight request promise.
 */
export function setInflight(key: string, promise: Promise<any>): void {
  inflight.set(key, promise);
  // Clean up on completion (success or failure)
  promise.finally(() => {
    inflight.delete(key);
  });
}

/**
 * Invalidate cache entries matching a prefix.
 * Called automatically on POST/PATCH/DELETE to keep cache fresh.
 * 
 * Example: invalidate("/products") clears all cached /products* entries.
 */
export function invalidate(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Invalidate ALL cached entries.
 */
export function invalidateAll(): void {
  cache.clear();
}

/**
 * Extract the resource path base from a URL for invalidation.
 * e.g. "/api/v1/products/abc" → "/api/v1/products"
 *      "/api/v1/products?limit=100" → "/api/v1/products"
 */
export function getResourceBase(url: string): string {
  // Remove query string
  const path = url.split('?')[0];
  // Remove trailing ID-like segments for broader invalidation
  // e.g. /products/abc123 → /products
  const segments = path.split('/');
  // If last segment looks like an ID (contains non-alpha chars or is a UUID-ish), pop it
  if (segments.length > 3) {
    const last = segments[segments.length - 1];
    if (last.includes('-') || last.includes('_') || /^[a-f0-9]{8,}$/i.test(last)) {
      segments.pop();
    }
  }
  return segments.join('/');
}
