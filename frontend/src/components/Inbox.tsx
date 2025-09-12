import React, { useEffect, useState } from "react";

interface Email {
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
}

const BACKEND_URL = "http://localhost:4000";

const Inbox: React.FC<{ username: string }> = ({ username }) => {
  const [inbox, setInbox] = useState<Email[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/emails/inbox/${username}`)
      .then((res) => res.json())
      .then((data) => setInbox(data.emails))
      .catch(() => setInbox([]));
  }, [username]);

  return (
    <div>
      <h2>Inbox</h2>
      {inbox.length === 0 ? (
        <p>No emails in inbox</p>
      ) : (
        inbox.map((email, idx) => (
          <div key={idx} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            <p><b>From:</b> {email.from}</p>
            <p><b>Subject:</b> {email.subject}</p>
            <p>{email.body}</p>
            <small>{email.date}</small>
          </div>
        ))
      )}
    </div>
  );
};

export default Inbox;
