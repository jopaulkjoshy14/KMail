import express from "express";
import {
  registerUser,
  loginUser,
  clearDatabase,
} from "../controllers/authController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ Clear all data (protected)
router.delete("/clear-db", protect, clearDatabase);

export default router;
