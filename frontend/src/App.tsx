import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import Inbox from "./components/Inbox";
import Sent from "./components/Sent";
import ComposeEmail from "./components/ComposeEmail";
import Profile from "./components/Profile";
import { ToastContainer } from "react-toastify";

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const location = useLocation();

  // Check URL for Google OAuth token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("token");
    if (oauthToken) {
      localStorage.setItem("token", oauthToken);
      setToken(oauthToken);
      window.history.replaceState({}, document.title, "/"); // clean URL
    } else {
      const storedToken = localStorage.getItem("token");
      if (storedToken) setToken(storedToken);
    }
  }, [location]);

  if (!token) {
    return <LoginForm onLogin={(t) => setToken(t)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Inbox token={token} />} />
        <Route path="/sent" element={<Sent token={token} />} />
        <Route path="/compose" element={<ComposeEmail token={token} />} />
        <Route path="/profile" element={<Profile token={token} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
