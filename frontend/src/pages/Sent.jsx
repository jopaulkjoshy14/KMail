import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance.js';

const Sent = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/messages/sent')
      .then((response) => setMessages(response.data))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-20 text-gray-500">Loading sent messages...</p>;
  if (!messages.length) return <p className="text-center mt-20 text-gray-500">No sent messages.</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Sent</h2>
      {messages.map((msg) => (
        <div key={msg._id} className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-2">
          <p>To: {msg.receiverUsernameHash.slice(0, 8)}...</p>
          <p>{msg.encryptedSubject}</p>
        </div>
      ))}
    </div>
  );
};

export default Sent;
