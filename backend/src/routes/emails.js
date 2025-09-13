// src/routes/emails.js
import express from "express";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

export default (db) => {
  // --------------------
  // Send email (encrypted body)
  // --------------------
  router.post("/send", authenticateToken, async (req, res) => {
    const { from, to, subject, body } = req.body;
    if (!from || !to || !subject || !body)
      return res.status(400).json({ error: "Missing fields" });

    // Validate sender/recipient exist
    const sender = await db.get("SELECT * FROM users WHERE email = ?", from);
    const recipient = await db.get("SELECT * FROM users WHERE email = ?", to);
    if (!sender) return res.status(400).json({ error: "Sender not found" });
    if (!recipient) return res.status(400).json({ error: "Recipient not found" });

    const date = new Date().toLocaleString();

    try {
      await db.run(
        "INSERT INTO emails (sender, recipient, subject, body, date) VALUES (?, ?, ?, ?, ?)",
        [from, to, subject, body, date]
      );
      res.json({ message: "Email sent successfully!" });
    } catch (err) {
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // --------------------
  // Inbox (fetch emails where recipient = username)
  // --------------------
  router.get("/inbox/:username", authenticateToken, async (req, res) => {
    const username = req.params.username;
    try {
      const emails = await db.all(
        "SELECT * FROM emails WHERE recipient = ? ORDER BY id DESC",
        username
      );
      res.json({ emails });
    } catch {
      res.status(500).json({ error: "Failed to fetch inbox" });
    }
  });

  // --------------------
  // Sent (fetch emails where sender = username)
  // --------------------
  router.get("/sent/:username", authenticateToken, async (req, res) => {
    const username = req.params.username;
    try {
      const emails = await db.all(
        "SELECT * FROM emails WHERE sender = ? ORDER BY id DESC",
        username
      );
      res.json({ emails });
    } catch {
      res.status(500).json({ error: "Failed to fetch sent emails" });
    }
  });

  return router;
};
