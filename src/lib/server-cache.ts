// Server-side in-memory cache for expensive DB queries
// TTL-based, auto-cleanup, zero dependencies

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

class ServerCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private maxSize: number;

  constructor(maxSize = 500) {
    this.maxSize = maxSize;
    // Auto cleanup every 60s
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number = 30000): void {
    // Evict oldest if at max size
    if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }

    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now(),
    });
  }

  invalidate(pattern: string): void {
    if (pattern === "*") {
      this.store.clear();
      return;
    }
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

// Global singleton
const globalForCache = globalThis as typeof globalThis & {
  __serverCache?: ServerCache;
};

export const serverCache = globalForCache.__serverCache ?? new ServerCache();

if (process.env.NODE_ENV !== "production") {
  globalForCache.__serverCache = serverCache;
}

// Helper: cache a DB query result
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number = 30000
): Promise<T> {
  const existing = serverCache.get<T>(key);
  if (existing !== null) return existing;

  const result = await fn();
  serverCache.set(key, result, ttlMs);
  return result;
}

// Cache TTL presets
export const CACHE_TTL = {
  SHORT: 10000,     // 10s - for rapidly changing data
  MEDIUM: 30000,    // 30s - default
  LONG: 120000,     // 2min - for slowly changing data
  STATIC: 600000,   // 10min - for nearly static data
} as const;
