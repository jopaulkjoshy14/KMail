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
// DB connection
// -------------------------
connectDB();

// -------------------------
// Middleware
// -------------------------
const allowedOrigin = process.env.CLIENT_URL || "*";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(express.json());

// -------------------------
// Health check route
// -------------------------
app.get("/api/health", (req, res) => {
  // mongoose.connection.readyState:
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  let dbStatus = "unknown";
  const state = mongoose.connection.readyState;

  if (state === 1) dbStatus = "connected";
  else if (state === 0) dbStatus = "disconnected";
  else if (state === 2) dbStatus = "connecting";
  else if (state === 3) dbStatus = "disconnecting";

  res.json({
    backend: "online",
    database: dbStatus,
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
