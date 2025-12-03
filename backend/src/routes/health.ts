import { Router } from "express";
const router = Router();

router.get("/health", (req, res) => res.json({ status: "ok" }));
router.get("/ready", (req, res) => res.json({ ready: true }));

export default router;
