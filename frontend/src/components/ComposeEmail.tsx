// src/components/ComposeEmail.tsx
import React, { useState, useEffect, useCallback } from "react";
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

  // Clear messages after 4 seconds
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  // 🔍 Debounced fetch for autocomplete suggestions
  useEffect(() => {
    if (!to) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const token = localStorage.getItem("jwt");
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
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [to, navigate]);

  // 🔑 AES-256 encryption with IV
  const encryptBody = useCallback((body: string, sharedKey: string) => {
    const iv = CryptoJS.lib.WordArray.random(16);
    const key = CryptoJS.SHA256(sharedKey); // derive 256-bit key
    const encrypted = CryptoJS.AES.encrypt(body, key, { iv });
    return {
      ciphertext: encrypted.toString(),
      iv: iv.toString(),
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!to || !subject || !body) {
      setMessage("⚠️ Please fill all fields.");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      const token = localStorage.getItem("jwt");
      const sharedKey = localStorage.getItem("sharedKey");

      if (!token || !sharedKey) {
        navigate("/login");
        return;
      }

      // Encrypt email body
      const { ciphertext, iv } = encryptBody(body, sharedKey);

      const email = {
        from: username,
        to,
        subject,
        body: ciphertext,
        iv,
      };

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
      <form onSubmit={handleSend}>
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
              maxHeight: "120px",
              overflowY: "auto",
              margin: 0,
              padding: "5px 10px",
              background: "#fff",
            }}
          >
            {suggestions.map((user, idx) => (
              <li
                key={idx}
                style={{
                  cursor: "pointer",
                  listStyle: "none",
                  padding: "5px 0",
                }}
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
          rows={8}
          style={{ width: "100%", resize: "vertical" }}
        />
        <br />
        <button type="submit" disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ComposeEmail;
