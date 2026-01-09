import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setAuthToken } from "../api";

type User = { id: string; email: string; name?: string; memberships?: any[] } | null;

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User>(null);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function decodeOrgFromToken(t: string | null) {
    try {
      if (!t) return null;
      const payload = JSON.parse(atob(t.split('.')[1]));
      return payload.orgId || null;
    } catch { return null; }
  }

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      setCurrentOrgId(decodeOrgFromToken(token));
      fetchMe();
    } else {
      setAuthToken(undefined);
      setUser(null);
      setCurrentOrgId(null);
    }
     
  }, [token]);

  async function fetchMe() {
    setLoading(true);
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data.user);
    } catch {
      setToken(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const res = await api.post("/api/auth/login", { email, password });
    const t = res.data.token;
    setToken(t);
    localStorage.setItem("token", t);
    return t;
  }

  async function signup(email: string, password: string, name?: string, orgName?: string) {
    const res = await api.post("/api/auth/signup", { email, password, name, orgName });
    const t = res.data.token;
    setToken(t);
    localStorage.setItem("token", t);
    return t;
  }

  function logout() {
    setToken(null);
    localStorage.removeItem("token");
  }

  return (
    <AuthContext.Provider value={{ token, user, currentOrgId, loading, login, signup, logout }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
