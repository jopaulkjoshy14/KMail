import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Email {
  recipient: string;
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
    const fetchEmails = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/emails/sent/${username}`);
        const data = await res.json();
        const sharedKey = localStorage.getItem("sharedKey");
        if (!sharedKey) throw new Error("Missing encryption key");

        const decryptedEmails = (data.emails || []).map((email: Email) => {
          const bytes = CryptoJS.AES.decrypt(email.body, sharedKey);
          return { ...email, body: bytes.toString(CryptoJS.enc.Utf8) };
        });

        setEmails(decryptedEmails);
        setMessage(decryptedEmails.length ? "" : "No sent emails.");
      } catch {
        setMessage("Failed to fetch sent emails or decrypt");
      }
    };

    fetchEmails();
  }, [username]);

  return (
    <div>
      <h2>Sent Emails</h2>
      {message && <p>{message}</p>}
      {emails.map((email, idx) => (
        <div key={idx} style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}>
          <p><strong>To:</strong> {email.recipient}</p>
          <p><strong>Subject:</strong> {email.subject}</p>
          <p>{email.body}</p>
          <p>{email.date}</p>
        </div>
      ))}
    </div>
  );
};

export default Sent;
