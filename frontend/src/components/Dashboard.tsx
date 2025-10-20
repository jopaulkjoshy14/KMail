// src/components/Dashboard.tsx
import React from "react";
import { Link, Outlet } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

interface Props {
  token: string;
  setToken: (token: string | null) => void;
}

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const Dashboard: React.FC<Props> = ({ token, setToken }) => {
  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    toast.info("Logged out successfully.");
  };

  // Clear all emails of current user
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

  return (
    <div>
      {/* Navbar */}
      <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="space-x-4">
          <Link to="/" className="hover:underline">
            Inbox
          </Link>
          <Link to="/sent" className="hover:underline">
            Sent
          </Link>
          <Link to="/compose" className="hover:underline">
            Compose
          </Link>
          <Link to="/profile" className="hover:underline">
            Profile
          </Link>
        </div>

        <div className="space-x-2">
          <button
            onClick={handleClearMyEmails}
            className="bg-gray-600 px-3 py-1 rounded hover:bg-gray-700 text-sm"
          >
            Clear My Emails
          </button>
          <button
            onClick={handleAdminClearDatabase}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm"
          >
            🧹 Clear DB (Admin)
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
