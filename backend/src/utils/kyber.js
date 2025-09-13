// src/utils/kyber.js
// Wrapper for Kyber key generation & shared secret derivation
// Using @openquantum/kyber (npm install @openquantum/kyber)

import kyber from "@openquantum/kyber";

// Initialize Kyber768 (recommended balance of performance & security)
const KYBER = kyber.Kyber768;

/**
 * Generate a Kyber keypair
 * @returns {Object} { publicKey, privateKey }
 */
export function generateKeyPair() {
  const { publicKey, secretKey } = KYBER.keypair();
  return { publicKey, privateKey: secretKey };
}

/**
 * Derive a shared secret given a recipient’s public key
 * @param {Uint8Array} publicKey
 * @returns {Object} { ciphertext, sharedSecret }
 */
export function encapsulate(publicKey) {
  const { ciphertext, sharedSecret } = KYBER.encapsulate(publicKey);
  return { ciphertext, sharedSecret };
}

/**
 * Derive the same shared secret from ciphertext and own private key
 * @param {Uint8Array} ciphertext
 * @param {Uint8Array} privateKey
 * @returns {Uint8Array} sharedSecret
 */
export function decapsulate(ciphertext, privateKey) {
  return KYBER.decapsulate(ciphertext, privateKey);
}
