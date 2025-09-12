import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { initDB } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let db;

// Initialize DB
initDB().then(database => {
  db = database;
  console.log("✅ Database ready");
});

// --------------------
// Health check
// --------------------
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "KMail backend running" });
});

// --------------------
// User registration
// --------------------
app.post("/users/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await db.run("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [
      username,
      hashedPassword,
      `${username}@kmail`,
    ]);
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "Username already exists" });
  }
});

// --------------------
// User login
// --------------------
app.post("/users/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });

  const user = await db.get("SELECT * FROM users WHERE username = ?", username);
  if (!user) return res.status(400).json({ error: "Invalid username or password" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid username or password" });

  res.json({ message: "Login successful", username: user.username });
});

// --------------------
// Get inbox
// --------------------
app.get("/emails/inbox/:username", async (req, res) => {
  const username = req.params.username;
  const emails = await db.all("SELECT * FROM emails WHERE recipient = ?", username);
  res.json({ emails });
});

// --------------------
// Get sent
// --------------------
app.get("/emails/sent/:username", async (req, res) => {
  const username = req.params.username;
  const emails = await db.all("SELECT * FROM emails WHERE sender = ?", username);
  res.json({ emails });
});

// --------------------
// Send email
// --------------------
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
app.listen(PORT, () => console.log(`✅ KMail backend running on port ${PORT}`));
