import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance.js';
import { toast } from 'react-toastify';

const Trash = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get('/messages/inbox?folder=trash')
      .then((res) => setMessages(res.data))
      .catch(() => toast.error('Failed to load trash'));
  }, []);

  if (!messages.length)
    return <p className="text-center mt-20 text-gray-500">Trash is empty.</p>;

  const restore = async (id) => {
    toast.info(`Restore ${id} (feature stub)`);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Trash</h2>
      {messages.map((msg) => (
        <div key={msg._id} className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-2 flex justify-between">
          <div>
            <p>From: {msg.senderUsernameHash.slice(0, 8)}...</p>
            <p>{msg.encryptedSubject}</p>
          </div>
          <button onClick={() => restore(msg._id)} className="text-blue-600 hover:text-blue-800">Restore</button>
        </div>
      ))}
    </div>
  );
};

export default Trash;
