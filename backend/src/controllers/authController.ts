import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { QuantumCrypto } from '../crypto/quantumCrypto';


export class AuthController {
static async register(req: Request, res: Response, next: NextFunction) {
try {
const { email, password, name } = req.body;
if (!email || !password || !name) throw createError('Email, password, and name are required', 400);
if (password.length < 8) throw createError('Password too short', 400);


const existing = await User.findOne({ email }).lean();
if (existing) throw createError('User already exists', 409);


const hashed = await bcrypt.hash(password, 12);
const [kyber, dilithium] = await Promise.all([QuantumCrypto.generateKyberKeyPair(), QuantumCrypto.generateDilithiumKeyPair()]);


const created = await User.create({
email,
password_hash: hashed,
name,
kyber_public_key: Buffer.from(kyber.publicKey || ''),
kyber_private_key: Buffer.from(kyber.privateKey || ''),
dilithium_public_key: Buffer.from(dilithium.publicKey || ''),
dilithium_private_key: Buffer.from(dilithium.privateKey || ''),
created_at: new Date(),
updated_at: new Date()
});


const token = generateToken(created._id.toString(), created.email);
res.status(201).json({ message: 'User registered', user: { id: created._id, email: created.email, name: created.name }, token });
} catch (err) {
next(err);
}
}


static async login(req: Request, res: Response, next: NextFunction) {
try {
const { email, password } = req.body;
if (!email || !password) throw createError('Email and password required', 400);
const user = await User.findOne({ email }).select('+password_hash');
if (!user) throw createError('Invalid email or password', 401);
const valid = await bcrypt.compare(password, user.password_hash);
if (!valid) throw createError('Invalid email or password', 401);
const token = generateToken(user._id.toString(), user.email);
res.json({ message: 'Login successful', user: { id: user._id, email: user.email, name: user.name }, token });
} catch (err) {
next(err);
}
}
}
