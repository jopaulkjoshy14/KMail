import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";  // 👈 added for DB status
import connectDB from "./db.js";
import authRoutes from "./routes/auth.js";
import emailRoutes from "./routes/emails.js";
import profileRoutes from "./routes/profile.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());

// ✅ Health Check Endpoint
app.get("/api/health", (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    let dbStatus =
      dbState === 1 ? "connected" :
      dbState === 2 ? "connecting" :
      dbState === 3 ? "disconnecting" : "disconnected";

    res.json({
      backend: "online",
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      backend: "offline",
      database: "unknown",
      error: err.message,
    });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/profile", profileRoutes);

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
