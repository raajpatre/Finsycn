import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { apiFetch } from "../api/client";

const AuthContext = createContext(null);
const STORAGE_KEY = "myfinance-auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  async function hydrateUser(nextToken) {
    const payload = await apiFetch("/auth/me", { token: nextToken });
    setUser(payload.user);
    return payload.user;
  }

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    hydrateUser(token)
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      async login(username, password) {
        try {
          setLoading(true);
          const payload = await apiFetch("/auth/login", {
            method: "POST",
            body: { username, password }
          });

          localStorage.setItem(STORAGE_KEY, payload.token);
          setToken(payload.token);
          await hydrateUser(payload.token);
        } finally {
          setLoading(false);
        }
      },
      async register(username, password) {
        try {
          setLoading(true);
          const payload = await apiFetch("/auth/register", {
            method: "POST",
            body: { username, password }
          });

          localStorage.setItem(STORAGE_KEY, payload.token);
          setToken(payload.token);
          await hydrateUser(payload.token);
        } finally {
          setLoading(false);
        }
      },
      logout() {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
        setLoading(false);
      }
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
