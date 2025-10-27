import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import authRoutes from "./routes/auth.js";
import emailRoutes from "./routes/emails.js";
import profileRoutes from "./routes/profile.js";
import { errorHandler } from "./middleware/errorHandler.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

// ✅ Health check route
app.get("/api/health", async (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  let dbState = "disconnected";
  if (dbStatus === 1) dbState = "connected";
  else if (dbStatus === 2) dbState = "connecting";

  res.json({
    backend: "online",
    database: dbState,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/profile", profileRoutes);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
