// src/components/ComposeEmail.tsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

interface Props {
  token: string;
}

// ✅ Use environment variable or fallback to "/api"
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const ComposeEmail: React.FC<Props> = ({ token }) => {
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipients || !content) {
      toast.error("Recipients and content are required");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/emails/send`,
        {
          recipients: recipients.split(",").map((r) => r.trim()),
          subject,
          content,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Email sent successfully");
      setRecipients("");
      setSubject("");
      setContent("");
      navigate("/sent");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Compose Email</h2>
      <form onSubmit={handleSend} className="space-y-4">
        <input
          type="text"
          placeholder="Recipients (comma separated)"
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          className="w-full p-3 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-3 border rounded"
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 border rounded h-40"
          required
        />
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {loading ? "Sending..." : "Send"}
          </button>
          <Link
            to="/"
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ComposeEmail;
