import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance.js';

const Inbox = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get('/messages/inbox').then((res) => setMessages(res.data || []));
  }, []);

  if (!messages.length)
    return <p className="text-center mt-20 text-gray-500">Inbox is empty. You're all caught up!</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Inbox</h2>
      {messages.map((msg) => (
        <div key={msg._id} className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-2">
          <p className="font-semibold">From: {msg.senderUsernameHash.slice(0, 8)}...</p>
          <p>{msg.encryptedSubject}</p>
          <p className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default Inbox;
