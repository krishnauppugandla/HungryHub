import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { API } from "../constants/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { setLoading(false); return; }

    api.get(API.ME)
      .then(({ data }) => {
        setUser(data.data.user);
        localStorage.setItem("user", JSON.stringify(data.data.user));
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post(API.LOGIN, { email, password });
    const { user: u, accessToken } = data.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post(API.REGISTER, payload);
    const { user: u, accessToken } = data.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post(API.LOGOUT); } catch { /* ignore */ }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Called by OAuthButtons after receiving a provider token
  const oauthLogin = useCallback(async (endpoint, payload) => {
    const { data } = await api.post(endpoint, payload);
    const { user: u, accessToken } = data.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, oauthLogin, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
