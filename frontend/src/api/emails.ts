import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export const fetchInbox = (token: string) =>
  axios.get(`${API_BASE}/emails/inbox`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchSent = (token: string) =>
  axios.get(`${API_BASE}/emails/sent`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const sendEmail = (
  token: string,
  data: { recipients: string[]; subject: string; content: string }
) =>
  axios.post(`${API_BASE}/emails/send`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const clearEmails = (token: string) =>
  axios.delete(`${API_BASE}/emails/clear`, {
    headers: { Authorization: `Bearer ${token}` },
  });
