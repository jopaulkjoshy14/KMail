import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface Props {
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

const Dashboard: React.FC<Props> = ({ token, setToken }) => {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <div className="space-x-4">
          <Link to="/" className="text-blue-600 hover:underline font-semibold">Inbox</Link>
          <Link to="/sent" className="text-blue-600 hover:underline font-semibold">Sent</Link>
          <Link to="/compose" className="text-blue-600 hover:underline font-semibold">Compose</Link>
          <Link to="/profile" className="text-blue-600 hover:underline font-semibold">Profile</Link>
        </div>

        <div className="space-x-2">
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

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
