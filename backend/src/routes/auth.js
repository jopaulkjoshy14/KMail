import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
} from "../controllers/authController.js";

const router = express.Router();

// Register new user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Google OAuth callback
router.get("/google/callback", googleLogin);

export default router;
