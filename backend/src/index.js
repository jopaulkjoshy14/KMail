import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// SQLite setup
let db;
(async () => {
  db = await open({
    filename: "./kmail.db",
    driver: sqlite3.Database,
  });

  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      passwordHash TEXT,
      email TEXT UNIQUE
    )
  `);

  // Create emails table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fromUser TEXT,
      toUser TEXT,
      subject TEXT,
      body TEXT,
      date TEXT
    )
  `);
})();

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "KMail backend running" });
});

// User registration
app.post("/users/register", async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await db.run(
      "INSERT INTO users (username, passwordHash, email) VALUES (?, ?, ?)",
      [username, passwordHash, email]
    );
    res.json({ message: "User registered successfully!" });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "Username or email already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// User login
app.post("/users/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing username or password" });

  try {
    const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    if (!user) return res.status(400).json({ error: "Invalid username or password" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: "Invalid username or password" });

    res.json({ message: "Login successful", username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get inbox for a user
app.get("/emails/inbox/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const inbox = await db.all("SELECT * FROM emails WHERE toUser = ?", [username]);
    res.json({ emails: inbox });
  } catch {
    res.status(500).json({ error: "Failed to fetch inbox" });
  }
});

// Get sent emails for a user
app.get("/emails/sent/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const sent = await db.all("SELECT * FROM emails WHERE fromUser = ?", [username]);
    res.json({ emails: sent });
  } catch {
    res.status(500).json({ error: "Failed to fetch sent emails" });
  }
});

// Send email
app.post("/emails/send", async (req, res) => {
  const { from, to, subject, body } = req.body;
  if (!from || !to || !subject || !body)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const date = new Date().toLocaleString();
    await db.run(
      "INSERT INTO emails (fromUser, toUser, subject, body, date) VALUES (?, ?, ?, ?, ?)",
      [from, to, subject, body, date]
    );
    res.json({ message: "Email sent successfully!" });
  } catch {
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ KMail backend running on port ${PORT}`);
});
