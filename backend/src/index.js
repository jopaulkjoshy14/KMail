import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage (replace with DB later)
let inboxEmails = [];
let sentEmails = [];

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "KMail backend running" });
});

// Send email route
app.post("/emails/send", (req, res) => {
  const { to, subject, body } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const email = { id: Date.now().toString(), to, subject, body, date: new Date() };
  sentEmails.push(email);
  inboxEmails.push({ ...email, from: "you@example.com" }); // mock recipient inbox
  res.json({ message: "Email sent" });
});

// Fetch inbox emails
app.get("/emails/inbox", (req, res) => {
  res.json({ emails: inboxEmails });
});

// Fetch sent emails
app.get("/emails/sent", (req, res) => {
  res.json({ emails: sentEmails });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ KMail backend running on port ${PORT}`);
});
