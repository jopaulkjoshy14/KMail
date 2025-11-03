import Email from "../models/Email.js";
import { hybridEncrypt, hybridDecrypt } from "../utils/encryption.js";
import User from "../models/User.js"; // to fetch recipient public keys

// Send email (Quantum-safe hybrid encryption)
export const sendEmail = async (req, res) => {
  const { to, subject, content } = req.body;

  if (!to || !content)
    return res.status(400).json({ message: "Recipients and content required" });

  const recipients = to.split(",").map((r) => r.trim()).filter(Boolean);
  if (recipients.length === 0)
    return res.status(400).json({ message: "Recipients cannot be empty" });

  try {
    // Fetch recipient public keys from DB
    const users = await User.find({ email: { $in: recipients } }, "email pqPublicKey");
    if (users.length === 0)
      return res.status(400).json({ message: "No valid recipients found" });

    // Encrypt the message with hybrid encryption per recipient
    const wrappedKeys = {};
    let ciphertext, iv; // same ciphertext for all recipients, different wrapped AES keys
    for (const user of users) {
      const result = await hybridEncrypt(content, user.pqPublicKey);
      ciphertext = result.ciphertext;
      iv = result.iv;
      wrappedKeys[user.email] = result.wrappedKey; // Kyber-encapsulated AES key
    }

    const email = await Email.create({
      sender: req.user._id,
      recipients,
      subject: subject || "",
      ciphertext,
      iv,
      wrappedKeys,
    });

    res.status(201).json({ message: "Email sent securely", emailId: email._id });
  } catch (error) {
    console.error("Send email error:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
};

// Inbox (Decrypt PQC hybrid encrypted emails)
export const getInbox = async (req, res) => {
  try {
    const emails = await Email.find({ recipients: req.user.email })
      .populate("sender", "name email avatar")
      .sort({ createdAt: -1 });

    const decrypted = await Promise.all(
      emails.map(async (e) => {
        try {
          const decryptedContent = await hybridDecrypt(
            {
              ciphertext: e.ciphertext,
              iv: e.iv,
              wrappedKey: e.wrappedKeys[req.user.email],
            },
            req.user.pqPrivateKey
          );
          return { ...e._doc, content: decryptedContent };
        } catch {
          return { ...e._doc, content: "[Decryption failed]" };
        }
      })
    );

    res.json(decrypted);
  } catch (error) {
    console.error("Inbox fetch error:", error);
    res.status(500).json({ message: "Failed to fetch inbox" });
  }
};

// Sent items
export const getSent = async (req, res) => {
  try {
    const emails = await Email.find({ sender: req.user._id })
      .populate("sender", "name email avatar")
      .sort({ createdAt: -1 });

    const decrypted = await Promise.all(
      emails.map(async (e) => {
        try {
          const decryptedContent = await hybridDecrypt(
            {
              ciphertext: e.ciphertext,
              iv: e.iv,
              wrappedKey: e.wrappedKeys[req.user.email],
            },
            req.user.pqPrivateKey
          );
          return { ...e._doc, content: decryptedContent };
        } catch {
          return { ...e._doc, content: "[Decryption failed]" };
        }
      })
    );

    res.json(decrypted);
  } catch (error) {
    console.error("Sent fetch error:", error);
    res.status(500).json({ message: "Failed to fetch sent emails" });
  }
};

// Clear user emails
export const clearEmails = async (req, res) => {
  try {
    await Email.deleteMany({
      $or: [{ sender: req.user._id }, { recipients: req.user.email }],
    });
    res.json({ message: "All emails cleared" });
  } catch (error) {
    console.error("Clear emails error:", error);
    res.status(500).json({ message: "Failed to clear emails" });
  }
};
