"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { User } from "./types";

const STORAGE_KEY = "merkaz_miyum_user";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  loginAsStudent: (studentUser: User) => void;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const { login: apiLogin } = await import("./sheets-api");
      const res = await apiLogin(username, password);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error || "שגיאה בהתחברות" };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const loginAsStudent = useCallback((studentUser: User) => {
    setUser(studentUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(studentUser));
  }, []);

  const value: AuthContextType = {
    user,
    login,
    logout,
    loginAsStudent,
    isAdmin: user?.role === "admin",
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
