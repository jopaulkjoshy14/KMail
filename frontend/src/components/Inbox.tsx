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

const Inbox: React.FC<Props> = ({ token }) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://kmail.onrender.com/api/emails/inbox", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmails(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch inbox");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear all emails?")) return;
    try {
      await axios.delete("https://kmail.onrender.com/api/emails/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("All emails cleared");
      setEmails([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to clear emails");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Inbox</h2>
        <div className="space-x-2">
          <Link to="/compose" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Compose
          </Link>
          <Link to="/sent" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Sent
          </Link>
          <button
            onClick={handleClear}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Clear All
          </button>
        </div>
      </div>
      {loading ? (
        <p>Loading emails...</p>
      ) : emails.length === 0 ? (
        <p>No emails in inbox.</p>
      ) : (
        <div className="space-y-4">
          {emails.map((email) => (
            <div key={email._id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{email.sender.name} &lt;{email.sender.email}&gt;</p>
                  <p className="text-gray-600">{email.subject}</p>
                </div>
                <p className="text-gray-500 text-sm">{new Date(email.createdAt).toLocaleString()}</p>
              </div>
              <p className="mt-2">{email.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inbox;
