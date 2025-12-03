import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import QuantumCrypto from "../../shared/crypto/QuantumCrypto";
import AuditLog from "../models/AuditLog";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-must-be-64-bytes-in-prod";

router.post("/register", async (req, res) => {
  try {
    const { email, password, masterKey } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "email already exists" });

    const hashed = await bcrypt.hash(password, 12);
    // Generate PQC keypairs
    const kyber = await QuantumCrypto.generateKyberKeypair();
    const dil = await QuantumCrypto.generateDilithiumKeypair();
    // Encrypt private keys with masterKey (user-supplied passphrase) or server-side master
    const encryptedPriv = await QuantumCrypto.encryptPrivateKeys(masterKey || password, {
      kyber: kyber.privateKey,
      dilithium: dil.privateKey
    });

    const user = new User({
      email,
      password: hashed,
      pqcPublicKeys: { kyber: kyber.publicKey, dilithium: dil.publicKey },
      encryptedPrivateKeys: { kyber: encryptedPriv, dilithium: encryptedPriv }
    });
    await user.save();
    await AuditLog.create({ user: user._id, action: "register" });
    const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: "15m" });
    const refresh = jwt.sign({ sub: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ accessToken: token, refreshToken: refresh });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });
    await AuditLog.create({ user: user._id, action: "login" });
    const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: "15m" });
    const refresh = jwt.sign({ sub: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ accessToken: token, refreshToken: refresh });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  try {
    if (!refreshToken) return res.status(400).json({ error: "refreshToken required" });
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
    const token = jwt.sign({ sub: decoded.sub }, JWT_SECRET, { expiresIn: "15m" });
    res.json({ accessToken: token });
  } catch (err) {
    return res.status(401).json({ error: "invalid refresh token" });
  }
});

export default router;
      
