import axios from "axios";

const API_BASE = "https://kmail.onrender.com/api";

export const login = (email: string, password: string) =>
  axios.post(`${API_BASE}/auth/login`, { email, password });

export const register = (name: string, email: string, password: string) =>
  axios.post(`${API_BASE}/auth/register`, { name, email, password });
