import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export const login = (email: string, password: string) =>
  axios.post(`${API_BASE}/auth/login`, { email, password });

export const register = (name: string, email: string, password: string) =>
  axios.post(`${API_BASE}/auth/register`, { name, email, password });

export const googleLoginUrl = () => `${API_BASE}/auth/google`;
