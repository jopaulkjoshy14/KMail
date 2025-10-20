// src/components/Sent.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

interface Email {
  _id: string;
  sender: { name: string; email: string; avatar?: string };
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  // Fetch sent emails
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

  useEffect(() => {
    fetchSent();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return toast.info("No emails selected");
    if (!window.confirm("Delete selected emails?")) return;

    setDeleting(true);
    try {
      await axios.post(
        `${API_BASE}/emails/delete`,
        { ids: selectedIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Selected emails deleted");
      setEmails((prev) => prev.filter((e) => !selectedIds.includes(e._id)));
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete selected emails");
    } finally {
      setDeleting(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear all sent emails?")) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE}/emails/clear-sent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("All sent emails cleared");
      setEmails([]);
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to clear sent emails");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Sent Emails</h2>
        <div className="space-x-2">
          <Link
            to="/"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Inbox
          </Link>
          <Link
            to="/compose"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Compose
          </Link>
          <button
            onClick={handleDeleteSelected}
            disabled={deleting || selectedIds.length === 0}
            className={`px-4 py-2 rounded ${
              selectedIds.length === 0
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-orange-600 text-white hover:bg-orange-700"
            }`}
          >
            Delete Selected
          </button>
          <button
            onClick={handleClear}
            disabled={deleting || emails.length === 0}
            className={`px-4 py-2 rounded ${
              emails.length === 0
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            Clear All
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading sent emails...</p>
      ) : emails.length === 0 ? (
        <p>No sent emails.</p>
      ) : (
        <div className="space-y-4">
          {emails.map((email) => (
            <div key={email._id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(email._id)}
                    onChange={() => toggleSelect(email._id)}
                    className="mr-2"
                  />
                  <div>
                    <p className="font-semibold">
                      To: {email.recipients.join(", ")}
                    </p>
                    <p className="text-gray-600">{email.subject}</p>
                  </div>
                </div>
                <p className="text-gray-500 text-sm">
                  {new Date(email.createdAt).toLocaleString()}
                </p>
              </div>

              <p
                className="mt-2 cursor-pointer text-gray-800"
                onClick={() => toggleExpand(email._id)}
              >
                {expandedIds.includes(email._id)
                  ? email.content
                  : email.content.length > 50
                  ? email.content.slice(0, 50) + "..."
                  : email.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sent;
