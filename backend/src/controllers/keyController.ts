import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { createError } from '../middleware/errorHandler';
import { QuantumCrypto } from '../crypto/quantumCrypto';


export class KeyController {
static async getPublicKey(req: Request, res: Response, next: NextFunction) {
try {
const { email } = req.params;
if (!email) throw createError('Email required', 400);
const user = await User.findOne({ email }).select('kyber_public_key dilithium_public_key name key_rotated_at').lean();
if (!user) throw createError('User not found', 404);
res.json({ kyberPublicKey: user.kyber_public_key?.toString('base64'), dilithiumPublicKey: user.dilithium_public_key?.toString('base64'), name: user.name, keyRotatedAt: user.key_rotated_at });
} catch (err) { next(err); }
}


static async rotateKeys(req: Request, res: Response, next: NextFunction) {
try {
const userId = (req as any).user?.id;
const [kyber, dilithium] = await Promise.all([QuantumCrypto.generateKyberKeyPair(), QuantumCrypto.generateDilithiumKeyPair()]);
await User.findByIdAndUpdate(userId, { kyber_public_key: Buffer.from(kyber.publicKey || ''), kyber_private_key: Buffer.from(kyber.privateKey || ''), dilithium_public_key: Buffer.from(dilithium.publicKey || ''), dilithium_private_key: Buffer.from(dilithium.privateKey || ''), key_rotated_at: new Date(), updated_at: new Date() });
await AuditLog.create({ user_id: userId, action: 'ROTATE_KEYS', resource_type: 'keys', details: { algorithms: ['kyber','dilithium'] } });
res.json({ message: 'Keys rotated', rotatedAt: new Date().toISOString() });
} catch (err) { next(err); }
}
}
