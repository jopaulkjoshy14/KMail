import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import config from '../config/index.js';
import { validateEmail } from '../utils/validateEmail.js';

export const register = async (req, res, next) => {
  try {
    const { username, password, kyberPublicKey, dilithiumPublicKey } = req.body;
    if (!validateEmail(`${username}@kmail.com`))
      return res.status(400).json({ error: { code: 'INVALID_EMAIL', message: 'Username must end with @kmail.com' } });

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: { code: 'USER_EXISTS', message: 'User already exists.' } });

    const passwordHash = await bcrypt.hash(password, 12);
    const usernameHash = crypto.createHash('sha256').update(username).digest('hex');

    const user = await User.create({ username, usernameHash, passwordHash, kyberPublicKey, dilithiumPublicKey });
    const accessToken = jwt.sign({ username }, config.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ username }, config.JWT_REFRESH_SECRET, { expiresIn: '30d' });

    res.status(201).json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};
