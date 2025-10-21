import express from "express";
import { registerUser, loginUser, updateProfile, adminClearDatabase } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Auth
router.post("/register", registerUser);
router.post("/login", loginUser);

// Profile
router.get("/profile", protect, async (req, res) => {
  res.json({ name: req.user.name, email: req.user.email });
});
router.put("/profile", protect, updateProfile);

// Admin
router.post("/admin/clear-db", adminClearDatabase);

export default router;
