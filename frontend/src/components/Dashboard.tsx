import React from "react";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import Inbox from "./Inbox";
import Sent from "./Sent";
import Compose from "./Compose";

interface Props {
  token: string;
  onLogout: () => void;
}

const Dashboard: React.FC<Props> = ({ token, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Inbox</Link>
          <Link to="/sent" className="hover:underline">Sent</Link>
          <Link to="/compose" className="hover:underline">Compose</Link>
        </div>
        <div className="space-x-2">
          <button onClick={onLogout} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Logout</button>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 p-6 bg-gray-100">
        <Routes>
          <Route path="/" element={<Inbox token={token} />} />
          <Route path="/sent" element={<Sent token={token} />} />
          <Route path="/compose" element={<Compose token={token} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
