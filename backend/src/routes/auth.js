import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  generateKeyPair,
  encapsulate,
  decapsulate,
} from "../utils/kyber.js";

const router = express.Router();

// Temporary in-memory storage of server Kyber private keys per session
// In production -> use Redis or DB, not memory
const kyberSessions = {};

export default (db) => {
  // --------------------
  // User registration
  // --------------------
  router.post("/register", async (req, res) => {
    let { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Missing fields" });

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

  // --------------------
  // Login Step 1:
  // Verify credentials + return Kyber public key
  // --------------------
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Missing fields" });

    const user = await db.get(
      "SELECT * FROM users WHERE username = ?",
      username
    );
    if (!user)
      return res.status(400).json({ error: "Invalid username or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: "Invalid username or password" });

    // ✅ Generate Kyber keypair for this session
    const { publicKey, privateKey } = generateKeyPair();

    // Store privateKey in memory for this username session
    kyberSessions[username] = privateKey;

    // Send publicKey back to client (so it can encapsulate)
    res.json({
      message: "Credentials valid, proceed with Kyber exchange",
      publicKey: Buffer.from(publicKey).toString("base64"),
    });
  });

  // --------------------
  // Login Step 2:
  // Client sends ciphertext, server decapsulates & issues JWT
  // --------------------
  router.post("/login/complete", async (req, res) => {
    const { username, ciphertext } = req.body;
    if (!username || !ciphertext)
      return res.status(400).json({ error: "Missing fields" });

    const privateKey = kyberSessions[username];
    if (!privateKey)
      return res.status(400).json({ error: "No Kyber session found" });

    // Convert ciphertext back to Uint8Array
    const ctBytes = Uint8Array.from(Buffer.from(ciphertext, "base64"));

    // Derive shared secret
    const sharedSecret = decapsulate(ctBytes, privateKey);

    // Wipe stored private key (one-time use)
    delete kyberSessions[username];

    // ✅ Issue JWT signed with server secret
    const token = jwt.sign(
      {
        username,
        sharedKey: Buffer.from(sharedSecret).toString("base64"),
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login complete", token });
  });

  return router;
};
