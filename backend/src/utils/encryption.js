import crypto from "crypto";

const key = Buffer.from(process.env.ENCRYPTION_KEY, "base64"); // decode base64
if (key.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be exactly 32 bytes long");
}

const ivLength = 16;

export const encrypt = (text) => {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const decrypt = (data) => {
  const [ivHex, encryptedText] = data.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
