import React, { useEffect, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Email {
  recipient: string;  // changed from 'to' to 'recipient'
  subject: string;
  body: string;
  date: string;
}

interface SentProps {
  username: string;
}

const Sent: React.FC<SentProps> = ({ username }) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch(`${BACKEND_URL}/emails/sent/${username}`)
      .then(res => res.json())
      .then(data => {
        setEmails(data.emails || []);
        setMessage(data.emails?.length ? "" : "No sent emails.");
      })
      .catch(() => setMessage("Failed to fetch sent emails"));
  }, [username]);

  return (
    <div>
      <h2>Sent Emails</h2>
      {message && <p>{message}</p>}
      {emails.map((email, idx) => (
        <div key={idx} style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}>
          <p><strong>To:</strong> {email.recipient}</p> {/* use recipient */}
          <p><strong>Subject:</strong> {email.subject}</p>
          <p>{email.body}</p>
          <p>{email.date}</p>
        </div>
      ))}
    </div>
  );
};

export default Sent;
