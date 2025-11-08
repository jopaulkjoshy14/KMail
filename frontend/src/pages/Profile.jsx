import { useState } from 'react';
import axios from '../utils/axiosInstance.js';
import { toast } from 'react-toastify';

const Profile = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/auth/password-update', { oldPassword, newPassword });
      toast.success('Password updated');
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <form onSubmit={handleUpdate} className="max-w-md mx-auto mt-10 space-y-4">
      <h2 className="text-2xl font-semibold">Profile Settings</h2>
      <input type="password" className="border p-2 w-full" placeholder="Current Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
      <input type="password" className="border p-2 w-full" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      <button className="bg-green-600 text-white px-6 py-2 rounded">Update Password</button>
    </form>
  );
};

export default Profile;
