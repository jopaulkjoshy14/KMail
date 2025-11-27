import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';


export interface AuthRequest extends Request { user?: any }


export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
const authHeader = req.headers['authorization'];
const token = authHeader && authHeader.split(' ')[1];
if (!token) return res.status(401).json({ error: 'Authentication required' });
jwt.verify(token, config.jwt.secret, (err, user) => {
if (err) return res.status(403).json({ error: 'Invalid token' });
req.user = user as any;
next();
});
};
