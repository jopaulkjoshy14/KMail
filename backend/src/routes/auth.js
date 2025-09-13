// src/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { kyber } from "../utils/kyber.js"; // ⬅️ we'll implement Kyber helper

const router = express.Router();

export default () => {
  // User registration
  router.post("/register", async (req, res) => {
    const db = req.app.locals.db;
    let { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (!username.includes("@")) username = `${username}@kmail.com`;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await db.run(
        "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
        [username, hashedPassword, username]
      );
      res.json({ message: "User registered successfully" });
    } catch (err) {
      res.status(400).json({ error: "Username already exists" });
    }
  });

  // User login
  router.post("/login", async (req, res) => {
    const db = req.app.locals.db;
    const { username, password, clientPubKey } = req.body;

    if (!username || !password || !clientPubKey) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await db.get("SELECT * FROM users WHERE username = ?", username);
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // ✅ PQC handshake (Kyber)
    const { serverPubKey, sharedSecret } = kyber.exchange(clientPubKey);

    // ✅ Use shared secret to sign JWT
    const token = jwt.sign(
      { username: user.username, email: user.email },
      sharedSecret.toString("hex"),
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      serverPubKey, // ⬅️ send back so client can verify
    });
  });

  return router;
};
