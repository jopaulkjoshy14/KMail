import React, { useEffect, useState } from "react";

interface Email {
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
}

const BACKEND_URL = "http://localhost:4000";

const Sent: React.FC<{ username: string }> = ({ username }) => {
  const [sent, setSent] = useState<Email[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/emails/sent/${username}`)
      .then((res) => res.json())
      .then((data) => setSent(data.emails))
      .catch(() => setSent([]));
  }, [username]);

  return (
    <div>
      <h2>Sent Emails</h2>
      {sent.length === 0 ? (
        <p>No sent emails</p>
      ) : (
        sent.map((email, idx) => (
          <div key={idx} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            <p><b>To:</b> {email.to}</p>
            <p><b>Subject:</b> {email.subject}</p>
            <p>{email.body}</p>
            <small>{email.date}</small>
          </div>
        ))
      )}
    </div>
  );
};

export default Sent;
