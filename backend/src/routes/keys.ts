import { Router } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import QuantumCrypto from "../../shared/crypto/QuantumCrypto";
import User from "../models/User";
import AuditLog from "../models/AuditLog";

const router = Router();

// Rotate keys: generate new keypairs and replace public keys; encryptedPrivateKeys must be updated after re-encryption
router.post("/rotate", requireAuth, async (req: AuthedRequest, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({ error: "not found" });
  const ky = await QuantumCrypto.generateKyberKeypair();
  const di = await QuantumCrypto.generateDilithiumKeypair();
  const encryptedPriv = await QuantumCrypto.encryptPrivateKeys(req.body.masterKey || "rotation-temp-key", { kyber: ky.privateKey, dilithium: di.privateKey });
  user.pqcPublicKeys = { kyber: ky.publicKey, dilithium: di.publicKey };
  user.encryptedPrivateKeys = { kyber: encryptedPriv, dilithium: encryptedPriv };
  await user.save();
  await AuditLog.create({ user: user._id, action: "rotate_keys" });
  res.json({ msg: "rotated" });
});

router.get("/public/:userId", async (req, res) => {
  const u = await User.findById(req.params.userId).select("pqcPublicKeys");
  if (!u) return res.status(404).json({ error: "user not found" });
  res.json(u.pqcPublicKeys);
});

export default router;
