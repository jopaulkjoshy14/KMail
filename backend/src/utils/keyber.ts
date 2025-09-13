// utils/kyber.ts
import { Kyber768 } from 'crystals-kyber-js';

/**
 * Generates a deterministic Kyber key pair based on a provided seed.
 * @param seed - A 64-byte seed for deterministic key generation.
 * @returns An array containing the public and private keys.
 */
export function generateDeterministicKeyPair(seed: Uint8Array): Promise<[Uint8Array, Uint8Array]> {
  const kyber = new Kyber768();
  return kyber.deriveKeyPair(seed);
}

/**
 * Encrypts a message using the Kyber public key.
 * @param message - The message to encrypt.
 * @param publicKey - The recipient's public key.
 * @returns The ciphertext.
 */
export async function encryptMessage(message: string, publicKey: Uint8Array): Promise<Uint8Array> {
  const kyber = new Kyber768();
  const [ciphertext] = await kyber.encapsulate(publicKey);
  return ciphertext;
}

/**
 * Decrypts a ciphertext using the Kyber private key.
 * @param ciphertext - The ciphertext to decrypt.
 * @param privateKey - The recipient's private key.
 * @returns The decrypted message.
 */
export async function decryptMessage(ciphertext: Uint8Array, privateKey: Uint8Array): Promise<string> {
  const kyber = new Kyber768();
  const message = await kyber.decapsulate(ciphertext, privateKey);
  return new TextDecoder().decode(message);
}
