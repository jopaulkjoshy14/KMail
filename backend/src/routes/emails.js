import express from "express";
import {
  sendEmail,
  getInbox,
  getSent,
  clearEmails,
} from "../controllers/emailController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Send a new email
router.post("/send", protect, sendEmail);

// Get inbox emails
router.get("/inbox", protect, getInbox);

// Get sent emails
router.get("/sent", protect, getSent);

// Clear all emails
router.delete("/clear", protect, clearEmails);

export default router;
