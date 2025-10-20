import express from "express";
import {
  registerUser,
  loginUser,
  adminClearDatabase,
  clearUserEmails,
} from "../controllers/authController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// ✅ Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ Clear logged-in user's emails (requires login)
router.delete("/clear-my-emails", protect, clearUserEmails);

// ✅ Clear entire database (admin key required, no token needed)
router.post("/admin/clear-db", adminClearDatabase);

export default router;
