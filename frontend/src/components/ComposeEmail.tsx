import React, { useState, useEffect } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface ComposeProps {
  username: string;
}

const ComposeEmail: React.FC<ComposeProps> = ({ username }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Fetch suggestions whenever 'to' changes
  useEffect(() => {
    if (!to) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/users/search?query=${encodeURIComponent(to)}`);
        const data = await res.json();
        if (res.ok) setSuggestions(data.users || []);
      } catch {
        // Ignore errors silently for suggestions
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [to]);

  const handleSend = async () => {
    if (!to || !subject || !body) {
      setMessage("⚠️ Please fill all fields.");
      return;
    }

    try {
      const checkRes = await fetch(`${BACKEND_URL}/users/check?email=${encodeURIComponent(to)}`);
      const checkData = await checkRes.json();
      if (!checkRes.ok || !checkData.exists) {
        setMessage("❌ Recipient does not exist.");
        return;
      }

      const email = { from: username, to, subject, body };
      const res = await fetch(`${BACKEND_URL}/emails/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Email sent successfully!");
        setTo("");
        setSubject("");
        setBody("");
        setSuggestions([]);
      } else {
        setMessage(`❌ ${data.error || "Failed to send email"}`);
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
        placeholder="To"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        autoComplete="off"
      />
      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <ul style={{ border: "1px solid #ccc", maxHeight: "100px", overflowY: "auto", margin: 0, padding: "0 10px" }}>
          {suggestions.map((user, idx) => (
            <li
              key={idx}
              style={{ cursor: "pointer", listStyle: "none", padding: "5px 0" }}
              onClick={() => { setTo(user); setSuggestions([]); }}
            >
              {user}
            </li>
          ))}
        </ul>
      )}
      <br />
      <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <br />
      <textarea placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} />
      <br />
      <button onClick={handleSend}>Send</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ComposeEmail;
