import express from "express";
import { registerUser, loginUser, adminClearDatabase } from "../controllers/authController.js";

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Admin clear DB
router.post("/admin/clear-db", adminClearDatabase);

export default router;
