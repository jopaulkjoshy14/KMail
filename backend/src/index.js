// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB } from "./db.js";

import authRoutes from "./routes/auth.js";
import emailRoutes from "./routes/emails.js";
import { authenticateToken } from "./middleware/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize DB
initDB()
  .then((database) => {
    app.locals.db = database;
    console.log("✅ Database ready");

    // Mount routes after DB is ready
    app.use("/users", authRoutes(database));
    app.use("/emails", emailRoutes(database));
  })
  .catch((err) => {
    console.error("❌ Failed to initialize DB:", err);
    process.exit(1);
  });

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "KMail backend running" });
});

// Example protected route
app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "You are authenticated!", user: req.user });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ KMail backend running on port ${PORT}`)
);
