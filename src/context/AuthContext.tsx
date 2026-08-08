"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "photographer" | "client";
  avatar?: string | null;
  phone?: string | null;
  studioId?: string | null;
  isActive: boolean;
}

interface Studio {
  id: string;
  name: string;
  slug?: string | null;
  specialty?: string[] | null;
  city?: string | null;
  instagram?: string | null;
  bio?: string | null;
  brandColor?: string | null;
  storageUsedMb: number;
  storageLimitMb: number;
}

interface AuthState {
  user: User | null;
  studio: Studio | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: User["role"] }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const AUTH_TIMEOUT_MS = 10000;

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...options,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    studio: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const checkSession = useCallback(async () => {
    try {
      const res = await authFetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setState({
            user: json.data.user,
            studio: json.data.studio,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }
    } catch {
      // Session check failed, not authenticated
    }
    setState({ user: null, studio: null, isAuthenticated: false, isLoading: false });
  }, []);

  // Check session on mount without blocking the login screen indefinitely.
  useEffect(() => {
    const timer = window.setTimeout(() => void checkSession(), 0);
    return () => window.clearTimeout(timer);
  }, [checkSession]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await authFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        return { success: false, error: json?.error || "Não foi possível entrar. Verifique as credenciais." };
      }

      setState({
        user: json.data.user,
        studio: json.data.studio,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true, role: json.data.user.role as User["role"] };
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === "AbortError";
      return {
        success: false,
        error: timedOut
          ? "O servidor demorou para responder. Verifique a conexão com o banco de dados."
          : "Erro de conexão. Tente novamente.",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Best effort
    }
    setState({ user: null, studio: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
