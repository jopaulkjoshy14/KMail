import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

// ✅ Auth endpoints
export const login = (email: string, password: string) =>
  axios.post(`${API_BASE}/auth/login`, { email, password });

export const register = (name: string, email: string, password: string) =>
  axios.post(`${API_BASE}/auth/register`, { name, email, password });

// ✅ Google login URL (kept for future use)
export const googleLoginUrl = () => `${API_BASE}/auth/google`;

// ✅ Clear logged-in user's emails (requires JWT in headers)
export const clearMyEmails = (token: string) =>
  axios.delete(`${API_BASE}/auth/clear-my-emails`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ✅ Admin: Clear entire database (admin key required)
export const adminClearDatabase = (adminKey: string) =>
  axios.post(`${API_BASE}/auth/admin/clear-db`, { adminKey });
