import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get current user profile
router.get("/", protect, getProfile);

// Update user profile
router.put("/", protect, updateProfile);

export default router;
