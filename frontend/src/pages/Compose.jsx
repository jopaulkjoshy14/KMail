import { useState } from 'react';
import axios from '../utils/axiosInstance.js';
import { toast } from 'react-toastify';

const Compose = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/messages/send', {
        receiverUsername: to.replace('@kmail.com', ''),
        encryptedSubject: btoa(subject),
        encryptedBody: btoa(body),
        attachmentIds: [],
        safeLinkToken: 'placeholder-token',
        signature: 'placeholder-signature',
      });
      toast.success('Message sent securely!');
      setTo(''); setSubject(''); setBody('');
    } catch {
      toast.error('Send failed');
    }
  };

  return (
    <form onSubmit={handleSend} className="p-4 space-y-4">
      <h2 className="text-2xl">Compose</h2>
      <input className="border p-2 w-full" placeholder="Recipient (username@kmail.com)" value={to} onChange={(e) => setTo(e.target.value)} />
      <input className="border p-2 w-full" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <textarea className="border p-2 w-full h-40" placeholder="Message..." value={body} onChange={(e) => setBody(e.target.value)} />
      <button className="bg-blue-600 text-white px-6 py-2 rounded">Send</button>
    </form>
  );
};
export default Compose;
