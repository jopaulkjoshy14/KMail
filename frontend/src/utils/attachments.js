// Encrypts files client-side using AES-GCM and wraps AES key with recipient's Kyber public key
// Decrypts files in memory when downloaded
import { openDB } from 'idb';
import axios from './axiosInstance.js';

export async function encryptAndUpload(file, recipientKyberPub) {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, await file.arrayBuffer())
  );

  const kyber = await import('crystals-kyber-js');
  const wrappedKey = kyber.Kyber.encrypt(recipientKyberPub, new Uint8Array(await crypto.subtle.exportKey('raw', key)));

  const formData = new FormData();
  formData.append('file', new Blob([encrypted]), file.name);
  const { data } = await axios.post('/attachments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return {
    fileId: data.id,
    iv: Array.from(iv),
    wrappedKey: Array.from(wrappedKey.ciphertext),
  };
}

export async function downloadAndDecrypt(fileId, wrappedKeyBlob, ivArray, privateKyberKey) {
  const kyber = await import('crystals-kyber-js');
  const aesKeyBytes = kyber.Kyber.decrypt(privateKyberKey, new Uint8Array(wrappedKeyBlob));

  const key = await crypto.subtle.importKey('raw', aesKeyBytes, 'AES-GCM', false, ['decrypt']);

  const { data } = await axios.get(`/attachments/${fileId}`, { responseType: 'arraybuffer' });
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(ivArray) }, key, data);
  return new Blob([new Uint8Array(decrypted)]);
}

export async function saveAttachmentMetadata(messageId, attachmentInfo) {
  const db = await openDB('kmail-db', 1, { upgrade(db) { db.createObjectStore('attachments'); } });
  await db.put('attachments', attachmentInfo, messageId);
}
