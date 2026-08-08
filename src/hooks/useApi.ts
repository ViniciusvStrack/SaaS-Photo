"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ============ TYPES ============
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (data: T | null) => void;
}

interface ApiOptions {
  enabled?: boolean;
  cacheTTL?: number;
  dedupe?: boolean;
}

// ============ OPTIMIZED CACHE (in-memory with TTL) ============
const cache = new Map<string, { data: unknown; expiresAt: number }>();
const inflight = new Map<string, Promise<unknown>>();

const DEFAULT_TTL = 60000; // 1 min default cache

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.data as T;
  if (entry) cache.delete(key);
  return null;
}

export function setCached<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  cache.set(key, { data, expiresAt: Date.now() + ttl });
}

export function invalidateCache(pattern: string): void {
  const regex = new RegExp(pattern.replace(/\*/g, ".*"));
  for (const key of cache.keys()) {
    if (regex.test(key)) cache.delete(key);
  }
}

export function clearCache(): void {
  cache.clear();
}

// ============ SMART FETCH (with in-flight dedup) ============
async function smartFetch<T>(url: string, signal?: AbortSignal): Promise<T> {
  // Return in-flight request if duplicate
  const pending = inflight.get(url);
  if (pending) return pending as Promise<T>;

  const promise = (async () => {
    try {
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal,
      });

      const json: ApiResponse<T> = await res.json();

      if (!res.ok || !json.success) {
        if (res.status === 401) {
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            window.location.href = "/login?expired=1";
          }
        }
        throw new Error(json.error || `HTTP ${res.status}`);
      }

      return json.data as T;
    } finally {
      inflight.delete(url);
    }
  })();

  inflight.set(url, promise);
  return promise;
}

// ============ USE API HOOK (GET) — Optimized ============
export function useApi<T>(url: string | null, options?: ApiOptions): UseApiReturn<T> {
  const { enabled = true, cacheTTL = DEFAULT_TTL } = options || {};
  const [data, setData] = useState<T | null>(() => (url ? getCached<T>(url) : null));
  const [loading, setLoading] = useState(!data && enabled && !!url);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | undefined>(undefined);
  const mountedRef = useRef(true);
  const urlRef = useRef(url);
  urlRef.current = url;

  const fetchData = useCallback(async (skipCache = false) => {
    const currentUrl = urlRef.current;
    if (!currentUrl || !enabled) return;

    // Check cache
    if (!skipCache) {
      const cached = getCached<T>(currentUrl);
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }
    }

    // Abort previous
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await smartFetch<T>(currentUrl, abortRef.current.signal);
      if (!mountedRef.current) return;

      setData(result);
      setCached(currentUrl, result, cacheTTL);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled, cacheTTL]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [url]); // Re-fetch only when URL changes

  const refetch = useCallback(async () => {
    if (urlRef.current) {
      cache.delete(urlRef.current);
      await fetchData(true);
    }
  }, [fetchData]);

  const mutateLocal = useCallback((newData: T | null) => {
    setData(newData);
    if (urlRef.current && newData) setCached(urlRef.current, newData, cacheTTL);
  }, [cacheTTL]);

  return { data, loading, error, refetch, mutate: mutateLocal };
}

// ============ USE API MUTATION — Optimized ============
export function useApiMutation<TData = unknown, TResponse = unknown>(url: string, method: "POST" | "PATCH" | "DELETE" = "POST") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (body?: TData) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        const json: ApiResponse<TResponse> = await res.json();

        if (!res.ok || !json.success) {
          const msg = json.error || `HTTP ${res.status}`;
          setError(msg);
          return { success: false as const, error: msg };
        }

        // Invalidate related caches
        const baseUrl = url.split("?")[0].split("/").slice(0, -1).join("/");
        if (baseUrl) invalidateCache(baseUrl + "*");
        invalidateCache("/api/analytics*");
        invalidateCache("/api/dashboard*");

        return { success: true as const, data: json.data };
      } catch (err) {
        const msg = (err as Error).message;
        setError(msg);
        return { success: false as const, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [url, method]
  );

  return { mutate, loading, error, reset: () => setError(null) };
}

// ============ PREFETCH ============
export async function prefetchApi(url: string): Promise<void> {
  if (getCached(url)) return;
  try {
    await smartFetch(url);
  } catch {
    // silent fail
  }
}
