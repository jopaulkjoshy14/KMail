import crypto from "crypto";

// Derive key from environment variable
const baseKey = Buffer.from(process.env.ENCRYPTION_KEY, "utf-8");
if (baseKey.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be exactly 32 bytes long for AES-256-GCM");
}

// Constants
const IV_LENGTH = 12; // GCM standard 96-bit IV
const TAG_LENGTH = 16;

/**
 * Encrypt text using AES-256-GCM
 * @param {string} plaintext
 * @returns {string} base64(iv + ciphertext + authTag)
 */
export const encrypt = (plaintext) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", baseKey, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Combine IV + ciphertext + tag
  const payload = Buffer.concat([iv, ciphertext, authTag]);

  // Return base64 encoded string
  return payload.toString("base64");
};

/**
 * Decrypt text using AES-256-GCM
 * @param {string} encoded base64(iv + ciphertext + authTag)
 * @returns {string} plaintext
 */
export const decrypt = (encoded) => {
  const data = Buffer.from(encoded, "base64");
  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(data.length - TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH, data.length - TAG_LENGTH);

  const decipher = crypto.createDecipheriv("aes-256-gcm", baseKey, iv);
  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return plaintext.toString("utf8");
};
