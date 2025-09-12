import React, { useEffect, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Email {
  sender: string;   // changed from 'from' to 'sender'
  subject: string;
  body: string;
  date: string;
}

interface InboxProps {
  username: string;
}

const Inbox: React.FC<InboxProps> = ({ username }) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch(`${BACKEND_URL}/emails/inbox/${username}`)
      .then(res => res.json())
      .then(data => {
        setEmails(data.emails || []);
        setMessage(data.emails?.length ? "" : "No emails in inbox.");
      })
      .catch(() => setMessage("Failed to fetch inbox"));
  }, [username]);

  return (
    <div>
      <h2>Inbox</h2>
      {message && <p>{message}</p>}
      {emails.map((email, idx) => (
        <div key={idx} style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}>
          <p><strong>From:</strong> {email.sender}</p> {/* use sender */}
          <p><strong>Subject:</strong> {email.subject}</p>
          <p>{email.body}</p>
          <p>{email.date}</p>
        </div>
      ))}
    </div>
  );
};

export default Inbox;
