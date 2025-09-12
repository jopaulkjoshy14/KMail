import React, { useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface ComposeProps {
  username: string; // full email of sender
}

const ComposeEmail: React.FC<ComposeProps> = ({ username }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!to || !subject || !body) {
      setMessage("⚠️ Please fill all fields.");
      return;
    }

    if (!to.includes("@")) {
      setMessage("⚠️ Please enter the full email address of the recipient.");
      return;
    }

    const email = { from: username, to, subject, body };

    try {
      const res = await fetch(`${BACKEND_URL}/emails/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Email sent successfully!");
        setTo(""); setSubject(""); setBody("");
      } else {
        setMessage(`❌ ${data.error || 'Failed to send email'}`);
      }
    } catch {
      setMessage("❌ Backend not reachable");
    }
  };

  return (
    <div>
      <h2>Compose Email</h2>
      <input
        type="text"
        placeholder="To (full email)"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <br />
      <textarea
        placeholder="Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <br />
      <button onClick={handleSend}>Send</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ComposeEmail;
