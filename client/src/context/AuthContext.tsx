import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("applywise_token"));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let active = true;
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get<{ user: User }>("/auth/me")
      .then((response) => {
        if (active) {
          setUser(response.data.user);
        }
      })
      .catch(() => {
        localStorage.removeItem("applywise_token");
        if (active) {
          setUser(null);
          setToken(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    function handleUnauthorized() {
      setToken(null);
      setUser(null);
    }

    window.addEventListener("applywise:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("applywise:unauthorized", handleUnauthorized);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login: async (email, password) => {
        const response = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
        localStorage.setItem("applywise_token", response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
      },
      register: async (name, email, password) => {
        const response = await api.post<{ token: string; user: User }>("/auth/register", { name, email, password });
        localStorage.setItem("applywise_token", response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
      },
      logout: () => {
        localStorage.removeItem("applywise_token");
        setToken(null);
        setUser(null);
      }
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
