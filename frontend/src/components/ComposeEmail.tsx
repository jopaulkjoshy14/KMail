// frontend/src/components/ComposeEmail.tsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiSend } from "react-icons/fi";

interface Props {
  token: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const ComposeEmail: React.FC<Props> = ({ token }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const validateEmails = (emails: string[]) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.every((email) => emailRegex.test(email.trim()));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !content) return toast.error("Recipients and content are required");

    const recipients = to.split(",").map((email) => email.trim());
    if (!validateEmails(recipients)) return toast.error("One or more recipient emails are invalid");

    setSending(true);
    try {
      // Placeholder for KEYBER / Delithium encryption hook
      // const encryptedContent = encryptWithDelithium(content);

      await axios.post(
        `${API_BASE}/emails/send`,
        { recipients, subject, content }, // Replace content with encryptedContent when ready
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
    <div className="max-w-lg mx-auto">
      <form
        onSubmit={handleSend}
        className="bg-white shadow-md rounded-lg p-6 space-y-4 border border-gray-200"
      >
        <h2 className="text-xl font-semibold text-gray-800">Compose Email</h2>

        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">To</label>
          <input
            type="text"
            placeholder="Comma-separated emails"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">Subject</label>
          <input
            type="text"
            placeholder="Subject (optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">Content</label>
          <textarea
            placeholder="Type your email content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border rounded h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
        >
          {sending ? "Sending..." : <>Send Email <FiSend className="ml-2" /></>}
        </button>
      </form>
    </div>
  );
};

export default ComposeEmail;
