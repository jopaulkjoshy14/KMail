// src/components/LoginForm.tsx
import React, { useState } from "react";
import { encapsulate } from "../utils/kyber"; // client-side Kyber functions

type Props = {
  onLogin: (username: string) => void;
};

export default function LoginForm({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setMessage("⚠️ Please fill all fields");
      return;
    }

    // Always enforce email format on backend, but normalize here
    const finalUsername = username.includes("@")
      ? username.toLowerCase()
      : `${username.toLowerCase()}@kmail.com`;

    const endpoint = isRegister ? "register" : "login";

    try {
      // Step 1: Register or login (get server Kyber public key)
      const res1 = await fetch(`${BACKEND_URL}/users/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: finalUsername, password }),
      });

      const data1 = await res1.json();

      if (!res1.ok) {
        setMessage(data1.error || "❌ Failed");
        return;
      }

      if (isRegister) {
        // Registration complete
        setMessage(data1.message || "✅ Registered successfully");
        return;
      }

      // Login: server returns Kyber public key
      const serverPubKeyBase64 = data1.publicKey;
      if (!serverPubKeyBase64) {
        setMessage("❌ Missing server Kyber public key");
        return;
      }
      const serverPubKey = Uint8Array.from(
        atob(serverPubKeyBase64),
        (c) => c.charCodeAt(0)
      );

      // Step 2: Encapsulate shared key using server public key
      const { ciphertext, sharedSecret } = encapsulate(serverPubKey);

      // Send ciphertext to server to complete login
      const res2 = await fetch(`${BACKEND_URL}/users/login/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: finalUsername,
          ciphertext: btoa(String.fromCharCode(...ciphertext)),
        }),
      });

      const data2 = await res2.json();
      if (!res2.ok) {
        setMessage(data2.error || "❌ Failed to complete login");
        return;
      }

      // ✅ Store JWT (standardized as "token") and AES shared key (base64)
      localStorage.setItem("token", data2.token);
      localStorage.setItem(
        "sharedKey",
        btoa(String.fromCharCode(...sharedSecret))
      );

      setMessage("✅ Login successful");
      onLogin(finalUsername);
    } catch (err) {
      console.error(err);
      setMessage("❌ Backend not reachable");
    }
  };

  return (
    <div>
      <h2>{isRegister ? "Register" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ flex: 1 }}
          />
          {!username.includes("@") && (
            <span style={{ marginLeft: "5px", color: "#777" }}>@kmail.com</span>
          )}
        </div>
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit">{isRegister ? "Register" : "Login"}</button>
      </form>
      <button
        onClick={() => {
          setIsRegister(!isRegister);
          setMessage("");
        }}
      >
        {isRegister ? "Already have an account? Login" : "New user? Register"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
