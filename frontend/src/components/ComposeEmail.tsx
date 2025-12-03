import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Props {
  token: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const ComposeEmail: React.FC<Props> = ({ token }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject || !content) return toast.error("All fields are required");

    setSending(true);
    try {
      await axios.post(
        `${API_BASE}/emails/send`,
        { to, subject, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Email sent successfully!");
      setTo("");
      setSubject("");
      setContent("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="bg-white p-6 rounded shadow space-y-4">
      <input
        type="text"
        placeholder="To (comma-separated emails)"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="w-full p-3 border rounded"
        required
      />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full p-3 border rounded"
        required
      />
      <textarea
        placeholder="Email content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-3 border rounded h-40 resize-none"
        required
      />
      <button
        type="submit"
        disabled={sending}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {sending ? "Sending..." : "Send Email"}
      </button>
    </form>
  );
};

export default ComposeEmail;
