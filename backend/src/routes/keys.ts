import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { db } from '../config/database';
import { QuantumCrypto } from '../crypto/quantumCrypto';

const router = Router();

// Get user's public key
router.get('/public/:email', async (req, res, next) => {
  try {
    const { email } = req.params;

    const user = await db('users')
      .where({ email })
      .select('kyber_public_key', 'dilithium_public_key', 'name')
      .first();

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      kyberPublicKey: user.kyber_public_key.toString('base64'),
      dilithiumPublicKey: user.dilithium_public_key.toString('base64'),
      name: user.name,
    });
  } catch (error) {
    next(error);
  }
});

// Rotate user's keys
router.post('/rotate', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Generate new key pairs
    const [newKyberKeyPair, newDilithiumKeyPair] = await Promise.all([
      QuantumCrypto.generateKyberKeyPair(),
      QuantumCrypto.generateDilithiumKeyPair(),
    ]);

    // Update user's keys in database
    await db('users')
      .where({ id: userId })
      .update({
        kyber_public_key: newKyberKeyPair.publicKey,
        kyber_private_key: newKyberKeyPair.privateKey,
        dilithium_public_key: newDilithiumKeyPair.publicKey,
        dilithium_private_key: newDilithiumKeyPair.privateKey,
        key_rotated_at: new Date(),
        updated_at: new Date(),
      });

    res.json({
      message: 'Keys rotated successfully',
      rotatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// Get key rotation history
router.get('/history', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const keyHistory = await db('key_rotation_history')
      .where({ user_id: userId })
      .select('rotated_at', 'algorithm')
      .orderBy('rotated_at', 'desc')
      .limit(10);

    res.json({ keyHistory });
  } catch (error) {
    next(error);
  }
});

export default router;
