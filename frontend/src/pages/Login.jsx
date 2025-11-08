import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-80 space-y-4">
        <h2 className="text-xl font-semibold text-center">Login to KMail</h2>
        <input className="w-full p-2 rounded border" placeholder="you@kmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 rounded border" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Login</button>
      </form>
    </div>
  );
};

export default Login;
