import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

// Send a new email
export const sendEmail = async (
  token: string,
  recipients: string[],
  subject: string,
  content: string
) => {
  const res = await axios.post(
    `${API_BASE}/emails/send`,
    { recipients, subject, content },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
};

// Fetch inbox emails
export const getInbox = async (token: string) => {
  const res = await axios.get(`${API_BASE}/emails/inbox`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Fetch sent emails
export const getSent = async (token: string) => {
  const res = await axios.get(`${API_BASE}/emails/sent`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
