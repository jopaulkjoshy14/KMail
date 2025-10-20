// src/App.tsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Dashboard from "./components/Dashboard";
import Inbox from "./components/Inbox";
import Sent from "./components/Sent";
import ComposeEmail from "./components/ComposeEmail";
import Profile from "./components/Profile";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const location = useLocation();

  // ✅ Check for Google OAuth token or stored JWT
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("token");

    if (oauthToken) {
      localStorage.setItem("token", oauthToken);
      setToken(oauthToken);
      window.history.replaceState({}, document.title, "/");
    } else {
      const storedToken = localStorage.getItem("token");
      if (storedToken) setToken(storedToken);
    }
  }, [location]);

  // ✅ Auto-check JWT expiry every 60 seconds
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const exp = payload.exp * 1000; // convert seconds → ms
        if (Date.now() >= exp) {
          localStorage.removeItem("token");
          setToken(null);
          toast.warn("Session expired. Please log in again.");
        }
      } catch {
        localStorage.removeItem("token");
        setToken(null);
        toast.warn("Invalid token. Please log in again.");
      }
    }, 60000); // check every minute

    return () => clearInterval(interval);
  }, [token]);

  // ✅ Verify token with backend once (optional safeguard)
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;
      try {
        await axios.get(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        localStorage.removeItem("token");
        setToken(null);
        toast.warn("Session expired or invalid.");
      }
    };
    verifyToken();
  }, [token]);

  // ✅ Not logged in → show login or register
  if (!token) {
    return showRegister ? (
      <RegisterForm
        onRegister={(t) => setToken(t)}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <LoginForm
        onLogin={(t) => setToken(t)}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  // ✅ Logged in → render Dashboard with nested routes
  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Dashboard token={token} setToken={setToken} />}>
          <Route index element={<Inbox token={token} />} />
          <Route path="sent" element={<Sent token={token} />} />
          <Route path="compose" element={<ComposeEmail token={token} />} />
          <Route path="profile" element={<Profile token={token} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
