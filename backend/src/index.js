// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB } from "./db.js";

import authRoutes from "./routes/auth.js";
import { authenticateToken } from "./middleware/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let db;
initDB().then((database) => {
  db = database;
  console.log("✅ Database ready");

  // ✅ Mount routes after DB is ready
  app.use("/users", authRoutes(db));

  // Example of protecting routes:
  app.get("/protected", authenticateToken, (req, res) => {
    res.json({ message: "You are authenticated!", user: req.user });
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "KMail backend running" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ KMail backend running on port ${PORT}`)
);
