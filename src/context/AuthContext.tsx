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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    studio: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
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
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        return { success: false, error: json.error || "Erro ao fazer login" };
      }

      setState({
        user: json.data.user,
        studio: json.data.studio,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch {
      return { success: false, error: "Erro de conexão" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
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
