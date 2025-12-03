import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiMenu, FiX } from "react-icons/fi";

interface Props {
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

const Dashboard: React.FC<Props> = ({ token, setToken }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    toast.info("Logged out successfully");
    navigate("/");
  };

  // Admin: Clear entire database
  const handleAdminClearDatabase = async () => {
    const adminKey = prompt("Enter admin password to clear the entire database:");
    if (!adminKey) return;
    if (!window.confirm("⚠️ This will erase ALL users and emails. Continue?")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || "/api"}/auth/admin/clear-db`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to clear database");

      toast.success("Entire database cleared successfully!");
      localStorage.removeItem("token");
      setToken(null);
      toast.info("Database cleared. Please log in again.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-blue-600">KMail</h2>
        <nav className="flex flex-col space-y-4">
          <Link
            to="/"
            className="text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Inbox
          </Link>
          <Link
            to="/sent"
            className="text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Sent
          </Link>
          <Link
            to="/compose"
            className="text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Compose
          </Link>
        </nav>

        <div className="mt-auto space-y-2">
          <button
            onClick={handleAdminClearDatabase}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          >
            🧹 Clear Database
          </button>
          <div className="flex space-x-2 mt-2">
            <Link
              to="/profile"
              className="flex-1 bg-blue-600 text-white py-2 rounded text-center hover:bg-blue-700 transition"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top navbar */}
      <header className="md:hidden flex justify-between items-center bg-white shadow px-4 py-3">
        <h1 className="text-xl font-bold text-blue-600">KMail</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </header>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg p-4 space-y-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Inbox
          </Link>
          <Link
            to="/sent"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Sent
          </Link>
          <Link
            to="/compose"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Compose
          </Link>
          <button
            onClick={handleAdminClearDatabase}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          >
            🧹 Clear Database
          </button>
          <div className="flex space-x-2 mt-2">
            <Link
              to="/profile"
              className="flex-1 bg-blue-600 text-white py-2 rounded text-center hover:bg-blue-700 transition"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
