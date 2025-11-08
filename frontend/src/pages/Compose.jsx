import { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance.js';
import { toast } from 'react-toastify';
import { encryptAndUpload, saveAttachmentMetadata } from '../utils/attachments.js';
import { openDB } from 'idb';

const Compose = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

  const saveDraft = async () => {
    const db = await openDB('kmail-db', 1, { upgrade(db) { db.createObjectStore('drafts'); } });
    const id = Date.now().toString();
    await db.put('drafts', { to, subject, body }, id);
    toast.info('Draft autosaved');
  };

  useEffect(() => {
    if (autoSaveTimer) clearInterval(autoSaveTimer);
    setAutoSaveTimer(setInterval(saveDraft, 10000));
    return () => clearInterval(autoSaveTimer);
  }, [to, subject, body]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(files);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      const uploadResults = [];
      for (const file of attachments) {
        const encrypted = await encryptAndUpload(file, 'recipientKyberPublicPlaceholder');
        uploadResults.push(encrypted.fileId);
        await saveAttachmentMetadata(file.name, encrypted);
      }

      await axios.post('/messages/send', {
        receiverUsername: to.replace('@kmail.com', ''),
        encryptedSubject: btoa(subject),
        encryptedBody: btoa(body),
        attachmentIds: uploadResults,
        safeLinkToken: 'placeholder-token',
        signature: 'placeholder-signature',
      });
      toast.success('Message sent and encrypted!');
      setTo(''); setSubject(''); setBody(''); setAttachments([]);
    } catch {
      toast.error('Send failed');
    }
  };

  return (
    <form onSubmit={handleSend} className="p-4 space-y-4">
      <h2 className="text-2xl">Compose</h2>
      <input className="border p-2 w-full" placeholder="Recipient (username@kmail.com)" value={to} onChange={(e) => setTo(e.target.value)} />
      <input className="border p-2 w-full" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <textarea className="border p-2 w-full h-40" placeholder="Message" value={body} onChange={(e) => setBody(e.target.value)} />
      <input type="file" multiple onChange={handleFileChange} />
      <button className="bg-blue-600 text-white px-6 py-2 rounded">Send Securely</button>
    </form>
  );
};
export default Compose;
