import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
  clearDatabase,
} from "../controllers/authController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/google/callback", googleLogin);

// ✅ Clear all data (protected)
router.delete("/clear-db", protect, clearDatabase);

export default router;
