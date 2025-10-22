import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

// Get user profile
export const getProfile = async (token: string) => {
  const res = await axios.get(`${API_BASE}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Update user profile
export const updateProfile = async (
  token: string,
  data: { name: string; currentPassword?: string; newPassword?: string }
) => {
  const res = await axios.put(`${API_BASE}/profile`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
