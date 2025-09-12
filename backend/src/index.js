import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite
let db;
(async () => {
  db = await open({
    filename: "./kmail.db",
    driver: sqlite3.Database
  });

  // Create tables if not exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      passwordHash TEXT,
      emailType TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender TEXT,
      recipient TEXT,
      subject TEXT,
      body TEXT,
      date TEXT
    );
  `);
})();

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "KMail backend running" });
});

// Register user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const emailType = "@kmail";
    const emailUsername = `${username}${emailType}`;

    await db.run(
      "INSERT INTO users (username, passwordHash, emailType) VALUES (?, ?, ?)",
      [emailUsername, passwordHash, emailType]
    );

    res.json({ message: "User registered", username: emailUsername });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT") {
      res.status(400).json({ error: "Username already exists" });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
});

// Login user
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const emailUsername = username.includes("@") ? username : `${username}@kmail`;

  const user = await db.get("SELECT * FROM users WHERE username = ?", emailUsername);
  if (!user) return res.status(400).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(400).json({ error: "Incorrect password" });

  res.json({ message: "Login successful", username: emailUsername });
});

// Get inbox
app.get("/emails/inbox/:user", async (req, res) => {
  const user = req.params.user;
  const emails = await db.all("SELECT * FROM emails WHERE recipient = ?", user);
  res.json({ emails });
});

// Get sent
app.get("/emails/sent/:user", async (req, res) => {
  const user = req.params.user;
  const emails = await db.all("SELECT * FROM emails WHERE sender = ?", user);
  res.json({ emails });
});

// Send email
app.post("/emails/send", async (req, res) => {
  const { from, to, subject, body } = req.body;
  if (!from || !to || !subject || !body) return res.status(400).json({ error: "Missing fields" });

  const date = new Date().toLocaleString();

  await db.run(
    "INSERT INTO emails (sender, recipient, subject, body, date) VALUES (?, ?, ?, ?, ?)",
    [from, to, subject, body, date]
  );

  res.json({ message: "Email sent successfully!" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ KMail backend running on port ${PORT}`);
});
