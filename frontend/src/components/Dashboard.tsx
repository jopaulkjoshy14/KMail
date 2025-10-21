// src/components/Dashboard.tsx
import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface Props {
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

const Dashboard: React.FC<Props> = ({ token, setToken }) => {
  const navigate = useNavigate();

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    toast.info("Logged out successfully");
    navigate("/"); // redirect to login
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <div className="space-x-4">
          <Link to="/" className="text-blue-600 hover:underline font-semibold">
            Inbox
          </Link>
          <Link to="/sent" className="text-blue-600 hover:underline font-semibold">
            Sent
          </Link>
          <Link to="/compose" className="text-blue-600 hover:underline font-semibold">
            Compose
          </Link>
          <Link to="/profile" className="text-blue-600 hover:underline font-semibold">
            Profile
          </Link>
        </div>

        <div>
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
