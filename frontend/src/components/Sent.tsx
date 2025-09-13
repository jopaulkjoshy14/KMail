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

const Sent: React.FC<Props> = ({ token }) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSent = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://kmail.onrender.com/api/emails/sent", {
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Sent Emails</h2>
        <div className="space-x-2">
          <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Inbox
          </Link>
          <Link to="/compose" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Compose
          </Link>
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
                <div>
                  <p className="font-semibold">
                    To: {email.recipients.join(", ")}
                  </p>
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

export default Sent;
