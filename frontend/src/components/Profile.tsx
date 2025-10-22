import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getProfile, updateProfile } from "../api/profile"; // API helper

interface Props {
  token: string;
}

const Profile: React.FC<Props> = ({ token }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getProfile(token);
        setName(data.name);
        setEmail(data.email);
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && !currentPassword) {
      return toast.error("Enter current password to change password");
    }

    setLoading(true);
    try {
      await updateProfile(token, { name, currentPassword, newPassword });
      toast.success("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
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
          <label className="block font-semibold mb-1">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-3 border rounded"
            placeholder="Enter current password to change"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border rounded"
            placeholder="Leave blank to keep current password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
