/**
 * backend/src/utils/encryption.js
 *
 * Hybrid Kyber KEM + AES-256-GCM helper utilities (Node.js).
 *
 * IMPORTANT:
 * - This file is intended as a utility / server-side helper for testing/migration.
 * - For full E2E (production) behavior, move encryption/decryption to client side.
 *
 * Required packages:
 *   npm install crystals-kyber-js
 *
 * The code assumes crystals-kyber-js exposes the Kyber768 API:
 *   const kyber = new Kyber768();
 *   const [pub, sk] = await kyber.generateKeyPair();
 *   const [ct, ss] = await kyber.encap(pub);
 *   const ss2 = await kyber.decap(ct, sk);
 *
 * All binary values exchanged with the DB/network are base64-encoded here.
 */

import crypto from "crypto";
import { Kyber768 } from "crystals-kyber-js"; // ensure installed

// --- constants
const AES_KEY_BYTES = 32; // AES-256
const AES_GCM_IV_BYTES = 12; // 96-bit IV for GCM
const AES_GCM_TAG_BYTES = 16;
const HKDF_HASH = "sha256";

/* ---------- low-level helpers ---------- */

/** HKDF-SHA256 (extract & expand). Returns Buffer of length 'length'. */
function hkdfSha256(ikm, length = 32, info = Buffer.alloc(0), salt = null) {
  // Node has crypto.hkdfSync in modern versions; use generic extract+expand for portability
  if (!salt) salt = Buffer.alloc(32, 0);
  const prk = crypto.createHmac(HKDF_HASH, salt).update(ikm).digest(); // extract
  // expand
  const hashLen = 32;
  const n = Math.ceil(length / hashLen);
  let t = Buffer.alloc(0);
  let okm = Buffer.alloc(0);
  for (let i = 0; i < n; i++) {
    const hmac = crypto.createHmac(HKDF_HASH, prk);
    hmac.update(Buffer.concat([t, info, Buffer.from([i + 1])]));
    t = hmac.digest();
    okm = Buffer.concat([okm, t]);
  }
  return okm.slice(0, length);
}

/** AES-256-GCM encrypt */
function aesGcmEncrypt(keyBuf, plaintextBuf, aad = null) {
  const iv = crypto.randomBytes(AES_GCM_IV_BYTES);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuf, iv);
  if (aad) cipher.setAAD(aad);
  const ct = Buffer.concat([cipher.update(plaintextBuf), cipher.final()]);
  const tag = cipher.getAuthTag();
  // return base64 of iv + ct + tag concatenated
  return Buffer.concat([iv, ct, tag]).toString("base64");
}

/** AES-256-GCM decrypt */
function aesGcmDecrypt(keyBuf, payloadB64, aad = null) {
  const data = Buffer.from(payloadB64, "base64");
  const iv = data.subarray(0, AES_GCM_IV_BYTES);
  const tag = data.subarray(data.length - AES_GCM_TAG_BYTES);
  const ct = data.subarray(AES_GCM_IV_BYTES, data.length - AES_GCM_TAG_BYTES);
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuf, iv);
  if (aad) decipher.setAAD(aad);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ct), decipher.final()]);
  return plaintext; // Buffer
}

/* ---------- Kyber wrapper helpers ---------- */

/** Generate a Kyber keypair (Kyber768). Returns base64 strings for public & secret */
export async function generateKyberKeypair() {
  const kyber = new Kyber768();
  const [pub, sk] = await kyber.generateKeyPair(); // Uint8Array
  const pubB64 = Buffer.from(pub).toString("base64");
  const skB64 = Buffer.from(sk).toString("base64");
  return { publicKey: pubB64, secretKey: skB64 };
}

/**
 * Encapsulate shared secret to a recipient public key (base64).
 * Returns { kyberCt: base64, sharedSecret: Buffer }
 * Note: usually you should not return sharedSecret to untrusted contexts.
 */
export async function kyberEncapsulate(recipientPubB64) {
  const kyber = new Kyber768();
  const pk = Uint8Array.from(Buffer.from(recipientPubB64, "base64"));
  const [ct, ss] = await kyber.encap(pk); // ct Uint8Array, ss Uint8Array
  return { kyberCt: Buffer.from(ct).toString("base64"), sharedSecret: Buffer.from(ss) };
}

/**
 * Decapsulate Kyber ciphertext with your secret key (both base64).
 * Returns sharedSecret Buffer.
 */
export async function kyberDecapsulate(kyberCtB64, mySkB64) {
  const kyber = new Kyber768();
  const ct = Uint8Array.from(Buffer.from(kyberCtB64, "base64"));
  const sk = Uint8Array.from(Buffer.from(mySkB64, "base64"));
  const ss = await kyber.decap(ct, sk); // Uint8Array
  return Buffer.from(ss);
}

/* ---------- high-level hybrid encryption API ---------- */

/**
 * Encrypt plaintext for a list of recipients.
 *
 * @param {string} plaintext - UTF-8 string
 * @param {Array<{ id?: string, pubKey: string }>} recipients - array of recipient objects with their base64 public key
 *
 * Returns:
 * {
 *   ciphertext: <base64 iv+ct+tag>,
 *   aesKeyWrappedPerRecipient: [{ id, kyber_ct: <b64>, wrappedKey: <b64 iv+ct+tag> }, ...]
 * }
 *
 * Process:
 * - Generate random AES session key
 * - Encrypt plaintext with AES-GCM using that session key
 * - For each recipient:
 *    - Kyber.encap(recipientPubKey) -> (ct, ss)
 *    - Derive KEK = HKDF(ss)
 *    - AES-GCM encrypt (wrap) the session key with KEK
 *    - Store kyber_ct and wrappedKey for that recipient
 */
export async function encryptForRecipients(plaintext, recipients) {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error("encryptForRecipients: recipients must be a non-empty array");
  }

  // 1) create AES session key
  const aesKey = crypto.randomBytes(AES_KEY_BYTES);

  // 2) encrypt plaintext with AES session key
  const ciphertextB64 = aesGcmEncrypt(aesKey, Buffer.from(plaintext, "utf8"));

  // 3) for each recipient, encapsulate and wrap AES key
  const wrappedArray = [];
  for (const r of recipients) {
    const recipientId = r.id || null;
    const recipientPubB64 = r.pubKey;
    // kyber encap
    const { kyberCt, sharedSecret } = await kyberEncapsulate(recipientPubB64);
    // derive KEK from sharedSecret
    const kek = hkdfSha256(sharedSecret, AES_KEY_BYTES, Buffer.from("KMail-KEM-wrap"));
    // wrap AES key with kek
    const wrappedKeyB64 = aesGcmEncrypt(kek, aesKey); // iv + wrappedKeyCipher + tag
    wrappedArray.push({
      id: recipientId,
      kyber_ct: kyberCt,
      wrappedKey: wrappedKeyB64,
    });
  }

  return {
    ciphertext: ciphertextB64,
    aesKeyWrappedPerRecipient: wrappedArray,
  };
}

/**
 * Decrypt an email blob for a recipient using their Kyber secret key.
 *
 * emailBlob structure expected:
 * {
 *   ciphertext: <base64 iv+ct+tag>,
 *   aesKeyWrappedPerRecipient: [{ id, kyber_ct: <b64>, wrappedKey: <b64> }, ...]
 * }
 *
 * @param {object} emailBlob
 * @param {string} mySecretKeyB64 - recipient kyber secret key (base64)
 * @param {string|null} maybeRecipientId - optional to pick correct wrapped entry by id
 * @returns {string} plaintext UTF-8
 */
export async function decryptForRecipient(emailBlob, mySecretKeyB64, maybeRecipientId = null) {
  if (!emailBlob || !emailBlob.ciphertext || !emailBlob.aesKeyWrappedPerRecipient) {
    throw new Error("Invalid emailBlob format");
  }

  // find matching wrapped entry
  let wrappedEntry = null;
  if (maybeRecipientId) {
    wrappedEntry = emailBlob.aesKeyWrappedPerRecipient.find((e) => e.id === maybeRecipientId);
  }
  if (!wrappedEntry) {
    // fallback: if single entry, use it; else fail
    if (emailBlob.aesKeyWrappedPerRecipient.length === 1) {
      wrappedEntry = emailBlob.aesKeyWrappedPerRecipient[0];
    } else {
      throw new Error("Multiple recipients present, specify your recipient id to select wrapped key");
    }
  }

  // 1) decapsulate kyber ciphertext to get shared secret
  const sharedSecret = await kyberDecapsulate(wrappedEntry.kyber_ct, mySecretKeyB64);
  // 2) derive KEK
  const kek = hkdfSha256(sharedSecret, AES_KEY_BYTES, Buffer.from("KMail-KEM-wrap"));
  // 3) unwrap AES session key (decrypt wrappedKey)
  const aesKeyBuf = aesGcmDecrypt(kek, wrappedEntry.wrappedKey); // returns Buffer of session key
  if (aesKeyBuf.length !== AES_KEY_BYTES) {
    throw new Error("Unwrapped AES key has invalid length");
  }
  // 4) decrypt message content with AES session key
  const plaintextBuf = aesGcmDecrypt(aesKeyBuf, emailBlob.ciphertext);
  return plaintextBuf.toString("utf8");
}

/* ---------- convenience utilities (exports for debugging/admin) ---------- */

export async function encapsulateToPublicKey(pubKeyB64) {
  return kyberEncapsulate(pubKeyB64);
}

export async function decapsulateCt(kyberCtB64, mySkB64) {
  return kyberDecapsulate(kyberCtB64, mySkB64);
}
