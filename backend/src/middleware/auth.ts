import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-must-be-64-bytes-in-prod";

export interface AuthedRequest extends Request {
  user?: any;
}

export const requireAuth = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const h = req.headers["authorization"];
  if (!h) return res.status(401).json({ error: "no auth header" });
  const parts = h.split(" ");
  if (parts.length !== 2) return res.status(401).json({ error: "bad auth header" });
  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "invalid token" });
  }
};
