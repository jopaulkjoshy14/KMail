// src/components/Sent.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Email {
  _id: string;
  sender: { name: string; email: string };
  recipients: string[];
  subject: string;
  content: string;
  createdAt: string;
}

interface Props {
  token: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const Sent: React.FC<Props> = ({ token }) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchSent = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/emails/sent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmails(res.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to fetch sent emails");
      } finally {
        setLoading(false);
      }
    };
    fetchSent();
  }, [token]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  if (loading) return <p>Loading sent emails...</p>;
  if (emails.length === 0) return <p>No sent emails.</p>;

  return (
    <div className="space-y-4">
      {emails.map((email) => (
        <div key={email._id} className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">
                To: {email.recipients.join(", ")}
              </p>
              <p className="text-gray-600">{email.subject}</p>
            </div>
            <p className="text-gray-500 text-sm">
              {new Date(email.createdAt).toLocaleString()}
            </p>
          </div>

          <pre
            className="mt-2 cursor-pointer text-gray-800 whitespace-pre-wrap"
            onClick={() => toggleExpand(email._id)}
          >
            {expandedIds.includes(email._id)
              ? email.content
              : email.content.length > 50
              ? email.content.slice(0, 50) + "..."
              : email.content}
          </pre>
        </div>
      ))}
    </div>
  );
};

export default Sent;
