// src/components/ComposeEmail.tsx
import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface ComposeProps {
  username: string;
}

const ComposeEmail: React.FC<ComposeProps> = ({ username }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();

  // Fetch suggestions for autocomplete
  useEffect(() => {
    if (!to) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(
          `${BACKEND_URL}/users/search?query=${encodeURIComponent(to)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.status === 401) {
          navigate("/login");
          return;
        }

        const data = await res.json();
        if (res.ok) setSuggestions(data.users || []);
      } catch {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [to, navigate]);

  const handleSend = async () => {
    if (!to || !subject || !body) {
      setMessage("⚠️ Please fill all fields.");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Check recipient exists
      const checkRes = await fetch(
        `${BACKEND_URL}/users/check?email=${encodeURIComponent(to)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const checkData = await checkRes.json();
      if (!checkRes.ok || !checkData.exists) {
        setMessage("❌ Recipient does not exist.");
        setSending(false);
        return;
      }

      // Encrypt email body with AES-256
      const sharedKey = localStorage.getItem("sharedKey");
      if (!sharedKey) {
        setMessage("❌ Missing encryption key. Please log in again.");
        setSending(false);
        return;
      }

      const encryptedBody = CryptoJS.AES.encrypt(body, sharedKey).toString();

      const email = { from: username, to, subject, body: encryptedBody };
      const res = await fetch(`${BACKEND_URL}/emails/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h2>✉️ Compose Email</h2>
      <input
        type="text"
        placeholder="To"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <ul
          style={{
            border: "1px solid #ccc",
            borderRadius: "5px",
            maxHeight: "100px",
            overflowY: "auto",
            margin: 0,
            padding: "5px 10px",
            background: "#fff",
          }}
        >
          {suggestions.map((user, idx) => (
            <li
              key={idx}
              style={{ cursor: "pointer", listStyle: "none", padding: "5px 0" }}
              onClick={() => {
                setTo(user);
                setSuggestions([]);
              }}
            >
              {user}
            </li>
          ))}
        </ul>
      )}
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
      <button onClick={handleSend} disabled={sending}>
        {sending ? "Sending..." : "Send"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ComposeEmail;
