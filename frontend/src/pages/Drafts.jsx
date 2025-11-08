import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { openDB } from 'idb';

const Drafts = () => {
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    loadDrafts();
  }, []);

  async function loadDrafts() {
    const db = await openDB('kmail-db', 1, { upgrade(db) { db.createObjectStore('drafts'); } });
    const keys = await db.getAllKeys('drafts');
    const all = await Promise.all(keys.map((key) => db.get('drafts', key).then((d) => ({ id: key, ...d }))));
    setDrafts(all);
  }

  const deleteDraft = async (id) => {
    const db = await openDB('kmail-db', 1);
    await db.delete('drafts', id);
    toast.info('Draft deleted');
    loadDrafts();
  };

  if (!drafts.length)
    return <p className="text-center mt-20 text-gray-500">No drafts saved.</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Drafts</h2>
      {drafts.map((d) => (
        <div key={d.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-2 flex justify-between">
          <div>
            <p className="text-sm text-gray-500">{d.to}@kmail.com</p>
            <p>{d.subject}</p>
          </div>
          <button onClick={() => deleteDraft(d.id)} className="text-red-600 hover:text-red-800">Delete</button>
        </div>
      ))}
    </div>
  );
};

export default Drafts;
