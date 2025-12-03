import { Router } from "express";
import User from "../models/User";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const u = await User.findById(req.user.sub).select("-password -encryptedPrivateKeys");
  res.json(u);
});

router.get("/public/:userId", async (req, res) => {
  const u = await User.findById(req.params.userId).select("pqcPublicKeys");
  if (!u) return res.status(404).json({ error: "user not found" });
  res.json(u.pqcPublicKeys);
});

export default router;
