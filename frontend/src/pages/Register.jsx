import { useState } from 'react';
import axios from '../utils/axiosInstance.js';
import { toast } from 'react-toastify';
import { generatePQKeys } from '../utils/crypto.js';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { kyberPublicKey, dilithiumPublicKey } = await generatePQKeys(username, password);
      await axios.post('/auth/register', {
        username,
        password,
        kyberPublicKey,
        dilithiumPublicKey,
      });
      toast.success('Registration successful');
    } catch {
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleRegister} className="bg-white dark:bg-gray-800 p-6 rounded shadow-md space-y-4 w-80">
        <h2 className="text-xl font-semibold text-center">Register</h2>
        <div className="relative">
          <input className="w-full p-2 border rounded" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" required />
          <span className="absolute right-2 top-2 text-gray-400">@kmail.com</span>
        </div>
        <input type="password" className="w-full p-2 border rounded" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white">
          {loading ? 'Generating keys...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
