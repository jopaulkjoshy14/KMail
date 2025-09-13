// src/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

export default (db) => {
  // User registration
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

  // User login
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

    // ✅ Issue JWT
    const token = jwt.sign(
      { username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  });

  return router;
};
