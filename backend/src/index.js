import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Simple in-memory email storage
const emails = {
  inbox: {}, // inbox[user] = []
  sent: {},  // sent[user] = []
};

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "KMail backend running" });
});

// Get inbox for a specific user
app.get("/emails/inbox/:user", (req, res) => {
  const user = req.params.user;
  res.json({ emails: emails.inbox[user] || [] });
});

// Get sent for a specific user
app.get("/emails/sent/:user", (req, res) => {
  const user = req.params.user;
  res.json({ emails: emails.sent[user] || [] });
});

// Send email
app.post("/emails/send", (req, res) => {
  const { from, to, subject, body } = req.body;

  if (!from || !to || !subject || !body) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const email = {
    from,
    to,
    subject,
    body,
    date: new Date().toLocaleString(),
  };

  // Save to sender's "sent"
  if (!emails.sent[from]) emails.sent[from] = [];
  emails.sent[from].push(email);

  // Save to recipient's "inbox"
  if (!emails.inbox[to]) emails.inbox[to] = [];
  emails.inbox[to].push(email);

  res.json({ message: "Email sent successfully!", email });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ KMail backend running on port ${PORT}`);
});
