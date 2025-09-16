// src/api/auth.ts
import axios from "axios";

// ✅ Use env var (set in .env or .env.example)
// Example in .env: VITE_API_BASE=https://kmail.onrender.com/api
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export const login = (email: string, password: string) =>
  axios.post(`${API_BASE}/auth/login`, { email, password });

export const register = (name: string, email: string, password: string) =>
  axios.post(`${API_BASE}/auth/register`, { name, email, password });
