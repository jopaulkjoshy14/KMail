import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import messagesRoutes from "./routes/messages";
import keysRoutes from "./routes/keys";
import healthRoutes from "./routes/health";

dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // handled by frontend
}));
app.use(compression());
app.use(express.json({ limit: "1mb" }));

// CORS - restrict using FRONTEND_URL env var
const FRONTEND = process.env.FRONTEND_URL || "https://your-frontend.onrender.com";
app.use(cors({
  origin: FRONTEND,
  optionsSuccessStatus: 200
}));

// Rate limiter
app.use(rateLimit({
  windowMs: 60*1000,
  max: 100
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/keys", keysRoutes);
app.use("/_health", healthRoutes);

// DB init
const MONGO = process.env.MONGO_URI || "";
if (!MONGO) {
  console.warn("MONGO_URI not provided. DB won't connect in development without it.");
} else {
  mongoose.connect(MONGO).then(() => {
    console.log("Connected to MongoDB Atlas");
  }).catch(err => {
    console.error("Mongo connection error:", err);
  });
}

export default app;
           
