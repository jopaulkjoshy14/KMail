// src/components/Dashboard.tsx
import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

interface Props {
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string | null>>; // ✅ Add this
}

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const Dashboard: React.FC<Props> = ({ token, setToken }) => { // ✅ include it here
  const navigate = useNavigate();

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null); // ✅ clear React state too
    toast.info("Logged out successfully");
    navigate("/"); // redirect to login
  };

  // ✅ Clear current user's emails
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

  // ✅ Admin: Clear entire database
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
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <div className="space-x-4">
          <Link to="/" className="text-blue-600 hover:underline font-semibold">Inbox</Link>
          <Link to="/sent" className="text-blue-600 hover:underline font-semibold">Sent</Link>
          <Link to="/compose" className="text-blue-600 hover:underline font-semibold">Compose</Link>
          <Link to="/profile" className="text-blue-600 hover:underline font-semibold">Profile</Link>
        </div>
        <div className="space-x-2">
          <button
            onClick={handleClearMyEmails}
            className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800 text-sm"
          >
            Clear My Emails
          </button>
          <button
            onClick={handleAdminClearDatabase}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
          >
            🧹 Clear Database
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Page content */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
