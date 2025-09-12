import React, { useEffect, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Email {
  to: string;
  subject: string;
  body: string;
  date: string;
}

interface SentProps {
  username: string;
}

const Sent: React.FC<SentProps> = ({ username }) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${BACKEND_URL}/emails/sent/${username}`)
      .then((res) => res.json())
      .then((data) => {
        setEmails(data.emails || []);
        setError("");
      })
      .catch(() => setError("❌ Failed to fetch sent emails"))
      .finally(() => setLoading(false));
  }, [username]);

  return (
    <div>
      <h2>Sent Emails</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && emails.length === 0 && <p>No sent emails.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {emails.map((email, idx) => (
          <div key={idx} style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "8px", background: "#f9f9f9" }}>
            <p><strong>To:</strong> {email.to}</p>
            <p><strong>Subject:</strong> {email.subject}</p>
            <p>{email.body}</p>
            <p style={{ fontSize: "0.85em", color: "#555" }}>{email.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sent;
