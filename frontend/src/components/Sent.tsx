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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch Sent Emails
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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === emails.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(emails.map((e) => e._id));
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return toast.info("No emails selected");
    if (!confirm("Delete selected emails?")) return;

    try {
      await Promise.all(
        selectedIds.map((id) =>
          axios.delete(`${API_BASE}/emails/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setEmails((prev) => prev.filter((e) => !selectedIds.includes(e._id)));
      setSelectedIds([]);
      toast.success("Selected emails deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete emails");
    }
  };

  if (loading) return <p>Loading sent emails...</p>;
  if (emails.length === 0) return <p>No sent emails.</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <input
            type="checkbox"
            checked={selectedIds.length === emails.length}
            onChange={toggleSelectAll}
          />{" "}
          <span className="ml-1">Select All</span>
        </div>
        <button
          onClick={deleteSelected}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete Selected
        </button>
      </div>

      {emails.map((email) => (
        <div
          key={email._id}
          className={`bg-white p-4 rounded shadow border ${
            selectedIds.includes(email._id)
              ? "border-blue-400 bg-blue-50"
              : "border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(email._id)}
                onChange={() => toggleSelect(email._id)}
              />
              <div>
                <p className="font-semibold">To: {email.recipients.join(", ")}</p>
                <p className="text-gray-600">{email.subject}</p>
              </div>
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
