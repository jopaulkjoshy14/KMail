import React, { useEffect, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Email {
  from: string;
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
      .then((res) => res.json())
      .then((data) => {
        const fetchedEmails = data.emails || [];
        setEmails(fetchedEmails.reverse()); // newest first
        setMessage(fetchedEmails.length ? "" : "No emails in inbox.");
      })
      .catch(() => setMessage("Failed to fetch inbox"));
  }, [username]);

  return (
    <div>
      <h2>Inbox</h2>
      {message && <p>{message}</p>}
      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        {emails.map((email, idx) => (
          <div key={idx} style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}>
            <p><strong>From:</strong> {email.from}</p>
            <p><strong>Subject:</strong> {email.subject}</p>
            <p>{email.body.length > 100 ? email.body.slice(0, 100) + "..." : email.body}</p>
            <p><em>{email.date}</em></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inbox;
