import React, { useState } from "react";
import { toast } from "react-toastify";
import { sendEmail } from "../api/emails"; // Using API helper

interface Props {
  token: string;
}

const ComposeEmail: React.FC<Props> = ({ token }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim and split recipients
    const recipientsArray = to
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r !== "");

    if (!recipientsArray.length || !subject.trim() || !content.trim()) {
      return toast.error("Recipients, subject, and content are all required");
    }

    setSending(true);
    try {
      await sendEmail(token, recipientsArray, subject.trim(), content.trim());
      toast.success("Email sent successfully!");
      setTo("");
      setSubject("");
      setContent("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSend}
      className="bg-white p-6 rounded shadow space-y-4 max-w-md mx-auto"
    >
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
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        {sending ? "Sending..." : "Send Email"}
      </button>
    </form>
  );
};

export default ComposeEmail;
