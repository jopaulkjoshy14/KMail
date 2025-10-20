// src/components/LoginForm.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Props {
  onLogin: (token: string) => void;
  onSwitchToRegister: () => void;
}

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const LoginForm: React.FC<Props> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<{ backend: string; database: string } | null>(null);

  // ✅ On mount, read token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  // Fetch backend + DB status
  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/health`);
      setStatus({ backend: res.data.backend, database: res.data.database });
    } catch {
      setStatus({ backend: "offline", database: "unknown" });
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      onLogin(res.data.token);
      toast.success("Login successful!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    toast.info("Logged out");
  };

  // Clear current user emails
  const handleClearMyEmails = async () => {
    if (!window.confirm("⚠️ Are you sure? This will delete all your emails.")) return;
    try {
      await axios.delete(`${API_BASE}/auth/clear-my-emails`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("All your emails have been deleted!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to clear emails");
    }
  };

  // Admin: Clear entire database
  const handleAdminClearDatabase = async () => {
    const adminKey = prompt("Enter admin password to clear the entire database:");
    if (!adminKey) return;
    if (!window.confirm("⚠️ This will erase ALL users and emails. Continue?")) return;

    try {
      await axios.post(`${API_BASE}/auth/admin/clear-db`, { adminKey });
      toast.success("Entire database cleared successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to clear database");
    }
  };

  const getColor = (state: string) => {
    switch (state) {
      case "online":
      case "connected":
        return "text-green-600";
      case "connecting":
        return "text-yellow-500";
      default:
        return "text-red-600";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">KMail</h2>

        {/* ✅ Always render buttons if token exists */}
        {token ? (
          <div className="text-center space-y-4">
            <p>You are currently logged in.</p>

            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white p-3 rounded hover:bg-red-700"
            >
              Logout
            </button>

            <button
              onClick={handleClearMyEmails}
              className="w-full bg-gray-700 text-white p-3 rounded hover:bg-gray-800"
            >
              Clear My Emails
            </button>

            <button
              onClick={handleAdminClearDatabase}
              className="w-full bg-red-700 text-white p-3 rounded hover:bg-red-800 text-sm"
            >
              🧹 Clear Entire Database (Admin)
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm">
            Don’t have an account?{" "}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:underline"
            >
              Register here
            </button>
          </p>
        </div>

        <div className="mt-6 p-3 bg-gray-50 rounded text-sm border text-center">
          <p>
            Backend:{" "}
            <span className={getColor(status?.backend || "offline")}>
              {status?.backend || "offline"}
            </span>{" "}
            | Database:{" "}
            <span className={getColor(status?.database || "unknown")}>
              {status?.database || "unknown"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
