import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./db.js";
import authRoutes from "./routes/auth.js";
import emailRoutes from "./routes/emails.js";
import profileRoutes from "./routes/profile.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// -------------------------
// Global Middlewares
// -------------------------
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://kmail-frontend.onrender.com"
    ],
    credentials: true,
  })
);

// -------------------------
// Connect Database
// -------------------------
connectDB();

// -------------------------
// Health Check Route
// -------------------------
app.get("/health", async (req, res) => {
  const dbState =
    mongoose.connection.readyState === 1 ? "online" : "offline";

  return res.json({
    backend: "online",
    database: dbState,
  });
});

// -------------------------
// API Routes
// -------------------------
app.use("/api/auth", authRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/profile", profileRoutes);

// Error handler
app.use(errorHandler);

// -------------------------
// Listen
// -------------------------
console.log("Render PORT is:", process.env.PORT);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
