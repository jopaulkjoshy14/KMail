import { Router } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import Message from "../models/Message";
import User from "../models/User";
import QuantumCrypto from "../../shared/crypto/QuantumCrypto";
import AuditLog from "../models/AuditLog";

const router = Router();

router.post("/send", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { recipientId, plaintext } = req.body;
    if (!recipientId || !plaintext) return res.status(400).json({ error: "recipientId and plaintext required" });
    const recipient = await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ error: "recipient not found" });

    // Encrypt with recipient's public kyber key
    const enc = await QuantumCrypto.encryptMessage(recipient.pqcPublicKeys?.kyber || "", plaintext);
    // Sign ciphertext with sender's private dilithium (decrypt user's encryptedPrivateKeys first in real implementation)
    // Here we use a placeholder masterKey path - production must obtain user's encrypted private key securely
    const sender = await User.findById(req.user.sub);
    const signature = await QuantumCrypto.signMessage(sender?.encryptedPrivateKeys.dilithium || "", Buffer.from(enc.ciphertext).toString("base64"));

    const msg = await Message.create({
      sender: sender?._id,
      recipient: recipient._id,
      ciphertext: JSON.stringify({ c: enc.ciphertext, iv: enc.iv, encapsulated: enc.encapsulated }),
      signature,
      createdAt: new Date()
    });

    await AuditLog.create({ user: sender?._id, action: "send_message", details: { to: recipient._id.toString(), messageId: msg._id.toString() } });
    res.json({ messageId: msg._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/inbox", requireAuth, async (req: AuthedRequest, res) => {
  const messages = await Message.find({ recipient: req.user.sub }).sort({ createdAt: -1 }).limit(100);
  res.json(messages);
});

router.get("/sent", requireAuth, async (req: AuthedRequest, res) => {
  const messages = await Message.find({ sender: req.user.sub }).sort({ createdAt: -1 }).limit(100);
  res.json(messages);
});

export default router;
