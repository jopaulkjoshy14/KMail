// src/routes/emails.js
import express from "express";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

export default (db) => {
  // --------------------
  // Send email (ciphertext + iv stored)
  // --------------------
  router.post("/send", authenticateToken, async (req, res) => {
    const { to, subject, body, iv } = req.body; // body = ciphertext, iv = AES IV
    const from = req.user.username; // ✅ trust JWT

    if (!from || !to || !subject || !body || !iv) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Validate sender/recipient exist
    const sender = await db.get("SELECT * FROM users WHERE email = ?", from);
    const recipient = await db.get("SELECT * FROM users WHERE email = ?", to);
    if (!sender) return res.status(400).json({ error: "Sender not found" });
    if (!recipient) return res.status(400).json({ error: "Recipient not found" });

    const date = new Date().toISOString();

    try {
      await db.run(
        `INSERT INTO emails (sender, recipient, subject, body, iv, date) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [from, to, subject, body, iv, date]
      );
      res.json({ message: "Email sent successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // --------------------
  // Inbox (return ciphertext + iv, client must decrypt)
  // --------------------
  router.get("/inbox/:username", authenticateToken, async (req, res) => {
    const username = req.params.username;

    try {
      const emails = await db.all(
        `SELECT id, sender, recipient, subject, body, iv, date
         FROM emails 
         WHERE recipient = ? 
         ORDER BY id DESC`,
        username
      );
      res.json({ emails });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch inbox" });
    }
  });

  // --------------------
  // Sent (return ciphertext + iv, client must decrypt)
  // --------------------
  router.get("/sent/:username", authenticateToken, async (req, res) => {
    const username = req.params.username;

    try {
      const emails = await db.all(
        `SELECT id, sender, recipient, subject, body, iv, date
         FROM emails 
         WHERE sender = ? 
         ORDER BY id DESC`,
        username
      );
      res.json({ emails });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch sent emails" });
    }
  });

  return router;
};
