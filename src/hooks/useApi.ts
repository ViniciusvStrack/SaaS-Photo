"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

interface UseApiOptions {
  enabled?: boolean;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
  retryCount?: number;
  retryDelay?: number;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (data: T | null) => void;
}

interface UseMutationReturn<TData, TResponse> {
  mutate: (data?: TData) => Promise<{ success: boolean; data?: TResponse; error?: string }>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

interface UseUploadReturn {
  upload: (file: File, onProgress?: (percent: number) => void) => Promise<{ success: boolean; url?: string; error?: string }>;
  loading: boolean;
  progress: number;
  error: string | null;
}

// ============ CACHE ============
const cache = new Map<string, { data: unknown; timestamp: number; expiresAt: number }>();
const pendingRequests = new Map<string, Promise<unknown>>();
const DEFAULT_CACHE_TTL = 30000; // 30 seconds

export function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
}

export function setCached<T>(key: string, data: T, ttlMs: number = DEFAULT_CACHE_TTL): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttlMs,
  });
}

export function invalidateCache(urlPattern: string): void {
  const regex = new RegExp(urlPattern.replace(/\*/g, ".*"));
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

export function clearCache(): void {
  cache.clear();
}

// ============ FETCH WITH RETRY ============
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 3,
  delay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      // Don't retry on client errors (4xx) except 429
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response;
      }
      
      // Retry on server errors (5xx) or rate limit (429)
      if (response.status >= 500 || response.status === 429) {
        if (i < retries - 1) {
          const retryAfter = response.headers.get("Retry-After");
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError || new Error("Request failed after retries");
}

// ============ ERROR HANDLING ============
function handleErrorResponse(status: number, errorMessage?: string): string {
  switch (status) {
    case 401:
      // Redirect to login on auth error
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login?expired=1";
      }
      return "Sessão expirada. Faça login novamente.";
    case 403:
      return "Você não tem permissão para esta ação.";
    case 404:
      return "Recurso não encontrado.";
    case 422:
      return errorMessage || "Dados inválidos. Verifique os campos.";
    case 429:
      return "Muitas requisições. Aguarde um momento.";
    case 500:
      return "Erro interno. Tente novamente mais tarde.";
    default:
      return errorMessage || "Ocorreu um erro. Tente novamente.";
  }
}

// ============ USE API HOOK (GET) ============
export function useApi<T>(
  url: string | null,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const {
    enabled = true,
    revalidateOnFocus = false,
    revalidateOnReconnect = true,
    refreshInterval,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(() => {
    if (url) {
      return getCached<T>(url);
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(!data && enabled && !!url);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return;

    // Check cache first
    const cached = getCached<T>(url);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    // Check for pending request (deduplication)
    const pending = pendingRequests.get(url);
    if (pending) {
      try {
        const result = await pending;
        if (mountedRef.current) {
          setData(result as T);
          setLoading(false);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError((err as Error).message);
          setLoading(false);
        }
      }
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    const requestPromise = (async () => {
      try {
        const response = await fetchWithRetry(
          url,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            signal: abortControllerRef.current?.signal,
          },
          retryCount,
          retryDelay
        );

        const json: ApiResponse<T> = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(handleErrorResponse(response.status, json.error));
        }

        const resultData = json.data as T;
        setCached(url, resultData);
        
        if (mountedRef.current) {
          setData(resultData);
          setError(null);
        }
        
        return resultData;
      } catch (err) {
        if ((err as Error).name === "AbortError") return null;
        
        const errorMessage = (err as Error).message || "Erro ao carregar dados";
        if (mountedRef.current) {
          setError(errorMessage);
        }
        throw err;
      } finally {
        pendingRequests.delete(url);
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    })();

    pendingRequests.set(url, requestPromise);
    await requestPromise;
  }, [url, enabled, retryCount, retryDelay]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      if (url) {
        cache.delete(url);
        fetchData();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [revalidateOnFocus, fetchData, url]);

  // Revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect) return;

    const handleOnline = () => {
      if (url) {
        cache.delete(url);
        fetchData();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [revalidateOnReconnect, fetchData, url]);

  // Refresh interval
  useEffect(() => {
    if (!refreshInterval || !url) return;

    const interval = setInterval(() => {
      cache.delete(url);
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, fetchData, url]);

  const mutate = useCallback((newData: T | null) => {
    setData(newData);
    if (url && newData) {
      setCached(url, newData);
    }
  }, [url]);

  const refetch = useCallback(async () => {
    if (url) {
      cache.delete(url);
      await fetchData();
    }
  }, [url, fetchData]);

  return { data, loading, error, refetch, mutate };
}

// ============ USE API MUTATION HOOK (POST/PATCH/DELETE) ============
export function useApiMutation<TData = unknown, TResponse = unknown>(
  url: string,
  method: "POST" | "PATCH" | "DELETE" = "POST"
): UseMutationReturn<TData, TResponse> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (data?: TData): Promise<{ success: boolean; data?: TResponse; error?: string }> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchWithRetry(
          url,
          {
            method,
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: data ? JSON.stringify(data) : undefined,
          },
          2,
          1000
        );

        const json: ApiResponse<TResponse> = await response.json();

        if (!response.ok || !json.success) {
          const errorMsg = handleErrorResponse(response.status, json.error);
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }

        // Invalidate related caches
        const baseUrl = url.split("?")[0].split("/").slice(0, -1).join("/");
        invalidateCache(baseUrl + "*");

        return { success: true, data: json.data };
      } catch (err) {
        const errorMsg = (err as Error).message || "Erro ao processar requisição";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [url, method]
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, reset };
}

// ============ USE API UPLOAD HOOK ============
export function useApiUpload(url: string): UseUploadReturn {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (
      file: File,
      onProgress?: (percent: number) => void
    ): Promise<{ success: boolean; url?: string; error?: string }> => {
      setLoading(true);
      setProgress(0);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();

        const uploadPromise = new Promise<{ success: boolean; url?: string; error?: string }>(
          (resolve, reject) => {
            xhr.upload.addEventListener("progress", (e) => {
              if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                setProgress(percent);
                onProgress?.(percent);
              }
            });

            xhr.addEventListener("load", () => {
              try {
                const response = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300 && response.success) {
                  resolve({ success: true, url: response.data?.url });
                } else {
                  const errorMsg = response.error || "Erro no upload";
                  setError(errorMsg);
                  resolve({ success: false, error: errorMsg });
                }
              } catch {
                setError("Erro ao processar resposta");
                resolve({ success: false, error: "Erro ao processar resposta" });
              }
            });

            xhr.addEventListener("error", () => {
              setError("Erro de conexão");
              reject(new Error("Erro de conexão"));
            });

            xhr.addEventListener("abort", () => {
              setError("Upload cancelado");
              reject(new Error("Upload cancelado"));
            });

            xhr.open("POST", url);
            xhr.withCredentials = true;
            xhr.send(formData);
          }
        );

        return await uploadPromise;
      } catch (err) {
        const errorMsg = (err as Error).message || "Erro no upload";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  return { upload, loading, progress, error };
}

// ============ PREFETCH ============
export async function prefetchApi(url: string): Promise<void> {
  if (getCached(url)) return;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success) {
        setCached(url, json.data);
      }
    }
  } catch {
    // Silently fail prefetch
  }
}

// ============ EXPORTS ============
export type { ApiResponse, UseApiOptions, UseApiReturn, UseMutationReturn, UseUploadReturn };
