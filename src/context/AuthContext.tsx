"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { installDemoAdminApi, uninstallDemoAdminApi } from "@/lib/demo-admin-api";

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
const DEMO_SESSION_KEY = "noirframe_demo_session";

const demoUsers: Record<string, { password: string; user: User; studio: Studio | null }> = {
  admin: {
    password: "admin",
    user: { id: "user-admin", email: "admin", name: "Admin NoirFrame", role: "admin", avatar: "NF", isActive: true },
    studio: null,
  },
  studio: {
    password: "studio",
    user: { id: "user-photographer", email: "studio", name: "Ana Luísa Rodrigues", role: "photographer", avatar: "AL", studioId: "studio-1", isActive: true },
    studio: { id: "studio-1", name: "Studio Lumière", slug: "studio-lumiere", city: "São Paulo, SP", brandColor: "#c9a96e", storageUsedMb: 46200, storageLimitMb: 204800 },
  },
  cliente: {
    password: "cliente",
    user: { id: "user-client", email: "cliente", name: "Marina Oliveira", role: "client", avatar: "MO", studioId: "studio-1", isActive: true },
    studio: { id: "studio-1", name: "Studio Lumière", slug: "studio-lumiere", city: "São Paulo, SP", brandColor: "#c9a96e", storageUsedMb: 46200, storageLimitMb: 204800 },
  },
};

const localAccessEmail = process.env.NEXT_PUBLIC_LOCAL_ACCESS_EMAIL?.trim().toLowerCase();
const localAccessPassword = process.env.NEXT_PUBLIC_LOCAL_ACCESS_PASSWORD;
if (localAccessEmail && localAccessPassword) {
  demoUsers[localAccessEmail] = {
    password: localAccessPassword,
    user: {
      id: "local-owner",
      email: localAccessEmail,
      name: "Vinicius Strack",
      role: "admin",
      avatar: "VS",
      isActive: true,
    },
    studio: null,
  };
}

function getDemoSession(email: string, password: string) {
  const demo = demoUsers[email.trim().toLowerCase()];
  return demo && demo.password === password.trim() ? { user: demo.user, studio: demo.studio } : null;
}

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
    const storedDemo = window.sessionStorage.getItem(DEMO_SESSION_KEY);
    if (storedDemo) {
      try {
        const demo = JSON.parse(storedDemo) as { user: User; studio: Studio | null };
        if (demo.user.role === "admin") installDemoAdminApi();
        setState({ ...demo, isAuthenticated: true, isLoading: false });
        return;
      } catch {
        window.sessionStorage.removeItem(DEMO_SESSION_KEY);
      }
    }
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
    // Demo/local access is intentionally client-only. Resolve it first so a
    // missing database cannot delay or block access to the UI preview.
    const immediateDemo = getDemoSession(email, password);
    if (immediateDemo) {
      if (immediateDemo.user.role === "admin") installDemoAdminApi();
      window.sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(immediateDemo));
      setState({ ...immediateDemo, isAuthenticated: true, isLoading: false });
      return { success: true, role: immediateDemo.user.role };
    }
    try {
      const res = await authFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        const demo = getDemoSession(email, password);
        if (demo) {
          window.sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demo));
          setState({ ...demo, isAuthenticated: true, isLoading: false });
          return { success: true, role: demo.user.role };
        }
        return { success: false, error: json?.error || "Não foi possível entrar. Verifique as credenciais." };
      }

      setState({
        user: json.data.user,
        studio: json.data.studio,
        isAuthenticated: true,
        isLoading: false,
      });
      window.sessionStorage.removeItem(DEMO_SESSION_KEY);
      uninstallDemoAdminApi();

      return { success: true, role: json.data.user.role as User["role"] };
    } catch (error) {
      const demo = getDemoSession(email, password);
      if (demo) {
        window.sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demo));
        setState({ ...demo, isAuthenticated: true, isLoading: false });
        return { success: true, role: demo.user.role };
      }
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
    window.sessionStorage.removeItem(DEMO_SESSION_KEY);
    uninstallDemoAdminApi();
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
