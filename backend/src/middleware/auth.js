// src/middleware/auth.js
import jwt from "jsonwebtoken";
import { sessionKeys } from "../routes/auth.js"; // ⬅️ import session key store

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  // Decode without verifying to get username
  let decoded;
  try {
    decoded = jwt.decode(token);
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }

  if (!decoded?.username) {
    return res.status(403).json({ error: "Invalid token payload" });
  }

  // Get the session-specific secret
  const sessionSecret = sessionKeys.get(decoded.username);
  if (!sessionSecret) {
    return res.status(403).json({ error: "Session expired or invalid" });
  }

  // Now verify with the correct session secret
  jwt.verify(token, sessionSecret, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}
