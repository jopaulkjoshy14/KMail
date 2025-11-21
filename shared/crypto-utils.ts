// Shared cryptographic utilities between frontend and backend
import { Buffer } from 'buffer';

export interface QuantumKeyPair {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedData {
  ciphertext: string;
  nonce: string;
  authTag?: string;
}

export class SharedCryptoUtils {
  // Convert between different buffer formats
  static bufferToBase64(buffer: Buffer | Uint8Array): string {
    if (buffer instanceof Buffer) {
      return buffer.toString('base64');
    } else {
      return Buffer.from(buffer).toString('base64');
    }
  }

  static base64ToBuffer(base64: string): Buffer {
    return Buffer.from(base64, 'base64');
  }

  static base64ToUint8Array(base64: string): Uint8Array {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }

  static uint8ArrayToBase64(array: Uint8Array): string {
    return Buffer.from(array).toString('base64');
  }

  // Generate random bytes in different formats
  static generateRandomBytes(length: number): Buffer {
    return Buffer.from(Array.from({ length }, () => Math.floor(Math.random() * 256)));
  }

  static generateRandomBase64(length: number): string {
    return this.generateRandomBytes(length).toString('base64');
  }

  // Key serialization/deserialization
  static serializeKeyPair(keyPair: { publicKey: Buffer; privateKey: Buffer }): QuantumKeyPair {
    return {
      publicKey: keyPair.publicKey.toString('base64'),
      privateKey: keyPair.privateKey.toString('base64'),
    };
  }

  static deserializeKeyPair(serialized: QuantumKeyPair): { publicKey: Buffer; privateKey: Buffer } {
    return {
      publicKey: Buffer.from(serialized.publicKey, 'base64'),
      privateKey: Buffer.from(serialized.privateKey, 'base64'),
    };
  }

  // Message serialization for encryption
  static serializeMessage(message: any): Buffer {
    return Buffer.from(JSON.stringify(message), 'utf-8');
  }

  static deserializeMessage(buffer: Buffer): any {
    return JSON.parse(buffer.toString('utf-8'));
  }

  // Validate cryptographic inputs
  static isValidBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch (e) {
      return false;
    }
  }

  static isValidPublicKey(key: string): boolean {
    if (!this.isValidBase64(key)) return false;
    
    const buffer = this.base64ToBuffer(key);
    // Basic validation - adjust based on your key format
    return buffer.length > 0 && buffer.length < 10000; // Reasonable key size limits
  }

  // Security utilities
  static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  // Timing attack protection for sensitive comparisons
  static secureCompare(a: string, b: string): boolean {
    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);
    
    if (aBuffer.length !== bBuffer.length) {
      return false;
    }
    
    return crypto.subtle.timingSafeEqual(aBuffer, bBuffer);
  }

  // Generate cryptographically secure random string
  static generateSecureRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomValues = new Uint8Array(length);
    
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(randomValues);
    } else {
      // Fallback for Node.js environment
      const crypto = require('crypto');
      crypto.randomFillSync(randomValues);
    }
    
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
    
    return result;
  }

  // Hash data (non-cryptographic, for identifiers)
  static async hashData(data: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto) {
      // Browser environment
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Node.js environment
      const crypto = require('crypto');
      return crypto.createHash('sha256').update(data).digest('hex');
    }
  }
}

// Export for both browser and Node.js
export default SharedCryptoUtils;
