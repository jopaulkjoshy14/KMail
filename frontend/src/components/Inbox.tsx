import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Email {
  sender: string;
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
    const fetchEmails = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/emails/inbox/${username}`);
        const data = await res.json();
        const sharedKey = localStorage.getItem("sharedKey");
        if (!sharedKey) throw new Error("Missing encryption key");

        const decryptedEmails = (data.emails || []).map((email: Email) => {
          const bytes = CryptoJS.AES.decrypt(email.body, sharedKey);
          return { ...email, body: bytes.toString(CryptoJS.enc.Utf8) };
        });

        setEmails(decryptedEmails);
        setMessage(decryptedEmails.length ? "" : "No emails in inbox.");
      } catch {
        setMessage("Failed to fetch inbox or decrypt emails");
      }
    };

    fetchEmails();
  }, [username]);

  return (
    <div>
      <h2>Inbox</h2>
      {message && <p>{message}</p>}
      {emails.map((email, idx) => (
        <div key={idx} style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}>
          <p><strong>From:</strong> {email.sender}</p>
          <p><strong>Subject:</strong> {email.subject}</p>
          <p>{email.body}</p>
          <p>{email.date}</p>
        </div>
      ))}
    </div>
  );
};

export default Inbox;
