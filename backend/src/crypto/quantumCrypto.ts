import { kyber } from 'pqc-kyber';
import { dilithium } from 'pqc-dilithium';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

export interface KeyPair {
  publicKey: Buffer;
  privateKey: Buffer;
}

export interface EncryptedMessage {
  ciphertext: Buffer;
  nonce: Buffer;
  authTag?: Buffer;
}

export class QuantumCrypto {
  // Generate Kyber key pair for key exchange
  static async generateKyberKeyPair(): Promise<KeyPair> {
    try {
      const keyPair = kyber.keyGen();
      return {
        publicKey: Buffer.from(keyPair.publicKey),
        privateKey: Buffer.from(keyPair.privateKey),
      };
    } catch (error) {
      throw new Error(`Kyber key generation failed: ${error}`);
    }
  }

  // Generate Dilithium key pair for signatures
  static async generateDilithiumKeyPair(): Promise<KeyPair> {
    try {
      const keyPair = dilithium.keyGen();
      return {
        publicKey: Buffer.from(keyPair.publicKey),
        privateKey: Buffer.from(keyPair.privateKey),
      };
    } catch (error) {
      throw new Error(`Dilithium key generation failed: ${error}`);
    }
  }

  // Encapsulate a shared secret using Kyber
  static async encapsulate(publicKey: Buffer): Promise<{ ciphertext: Buffer; sharedSecret: Buffer }> {
    try {
      const result = kyber.enc(publicKey);
      return {
        ciphertext: Buffer.from(result.ciphertext),
        sharedSecret: Buffer.from(result.sharedSecret),
      };
    } catch (error) {
      throw new Error(`Kyber encapsulation failed: ${error}`);
    }
  }

  // Decapsulate a shared secret using Kyber
  static async decapsulate(ciphertext: Buffer, privateKey: Buffer): Promise<Buffer> {
    try {
      const sharedSecret = kyber.dec(ciphertext, privateKey);
      return Buffer.from(sharedSecret);
    } catch (error) {
      throw new Error(`Kyber decapsulation failed: ${error}`);
    }
  }

  // Sign a message using Dilithium
  static async sign(message: Buffer, privateKey: Buffer): Promise<Buffer> {
    try {
      const signature = dilithium.sign(message, privateKey);
      return Buffer.from(signature);
    } catch (error) {
      throw new Error(`Dilithium signing failed: ${error}`);
    }
  }

  // Verify a signature using Dilithium
  static async verify(signature: Buffer, message: Buffer, publicKey: Buffer): Promise<boolean> {
    try {
      return dilithium.verify(signature, message, publicKey);
    } catch (error) {
      throw new Error(`Dilithium verification failed: ${error}`);
    }
  }

  // Encrypt message using AES-256-GCM with derived key
  static encryptMessage(message: Buffer, key: Buffer): EncryptedMessage {
    try {
      const nonce = randomBytes(12); // 96-bit nonce for GCM
      const cipher = createCipheriv('aes-256-gcm', key, nonce);
      
      const encrypted = Buffer.concat([
        cipher.update(message),
        cipher.final(),
      ]);
      
      const authTag = cipher.getAuthTag();
      
      return {
        ciphertext: encrypted,
        nonce,
        authTag,
      };
    } catch (error) {
      throw new Error(`Message encryption failed: ${error}`);
    }
  }

  // Decrypt message using AES-256-GCM
  static decryptMessage(encrypted: EncryptedMessage, key: Buffer): Buffer {
    try {
      const decipher = createDecipheriv('aes-256-gcm', key, encrypted.nonce);
      decipher.setAuthTag(encrypted.authTag!);
      
      return Buffer.concat([
        decipher.update(encrypted.ciphertext),
        decipher.final(),
      ]);
    } catch (error) {
      throw new Error(`Message decryption failed: ${error}`);
    }
  }

  // Generate random bytes for various cryptographic purposes
  static generateRandomBytes(length: number): Buffer {
    return randomBytes(length);
  }

  // Derive a key from a shared secret using HKDF-like approach
  static deriveKey(sharedSecret: Buffer, salt: Buffer, info: string): Buffer {
    // Simplified key derivation - in production, use proper HKDF
    const hmac = createHmac('sha256', salt);
    hmac.update(sharedSecret);
    hmac.update(Buffer.from(info));
    return hmac.digest();
  }
}

// HMAC implementation for key derivation
import { createHmac } from 'crypto';
