import { openDB } from 'idb';

// Handles post-quantum crypto via Dilithium and Kyber, with WebCrypto fallback.

export async function generatePQKeys(username, password) {
  try {
    const kyber = await import('crystals-kyber-js');
    const dilithium = await import('crystals-dilithium-js');

    const kyberKeyPair = kyber.Kyber.generateKeypair();
    const dilithiumKeyPair = dilithium.Dilithium.generateKeypair();

    const aesKey = await importPasswordKey(password);
    const encPrivateKeys = await encryptPrivateKeys(
      aesKey,
      JSON.stringify({ kyber: kyberKeyPair.privateKey, dilithium: dilithiumKeyPair.privateKey })
    );

    await storeEncryptedKey(username, encPrivateKeys);
    return { kyberPublicKey: kyberKeyPair.publicKey, dilithiumPublicKey: dilithiumKeyPair.publicKey };
  } catch (e) {
    console.warn('Quantum crypto not available, using WebCrypto fallback');
    const keyPair = await crypto.subtle.generateKey(
      { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
      true,
      ['encrypt', 'decrypt']
    );
    const exportedPub = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const encryptedPriv = await encryptPrivateKeys(await importPasswordKey(password), keyPair.privateKey);
    await storeEncryptedKey(username, encryptedPriv);
    return { kyberPublicKey: btoa(String.fromCharCode(...new Uint8Array(exportedPub))), dilithiumPublicKey: 'fallback' };
  }
}

async function importPasswordKey(password) {
  const enc = new TextEncoder().encode(password);
  return crypto.subtle.importKey('raw', enc, 'PBKDF2', false, ['deriveKey']);
}

async function encryptPrivateKeys(aesKey, data) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    aesKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  const encodedData = new TextEncoder().encode(data);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encodedData);
  return { ciphertext: Array.from(new Uint8Array(ciphertext)), iv: Array.from(iv), salt: Array.from(salt) };
}

async function storeEncryptedKey(username, encData) {
  const db = await openDB('kmail-db', 1, {
    upgrade(db) {
      db.createObjectStore('keys');
    },
  });
  await db.put('keys', encData, username);
}
