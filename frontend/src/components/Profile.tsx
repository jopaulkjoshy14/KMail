// src/components/Profile.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Props {
  token: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const Profile: React.FC<Props> = ({ token }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setName(res.data.name);
      setEmail(res.data.email);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `${API_BASE}/profile`,
        { name, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile updated successfully");
      setPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full p-3 border rounded bg-gray-200"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded"
            placeholder="Leave blank to keep current"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
