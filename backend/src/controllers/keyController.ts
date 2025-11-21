import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { QuantumCrypto } from '../crypto/quantumCrypto';

export class KeyController {
  static async getPublicKey(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.params;

      if (!email || !email.includes('@')) {
        throw createError('Valid email is required', 400);
      }

      const user = await db('users')
        .where({ email })
        .select('kyber_public_key', 'dilithium_public_key', 'name', 'key_rotated_at')
        .first();

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({
        kyberPublicKey: user.kyber_public_key.toString('base64'),
        dilithiumPublicKey: user.dilithium_public_key.toString('base64'),
        name: user.name,
        keyRotatedAt: user.key_rotated_at,
      });
    } catch (error) {
      next(error);
    }
  }

  static async rotateKeys(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;

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

      // Log key rotation
      await db('key_rotation_history').insert({
        user_id: userId,
        algorithm: 'kyber_dilithium',
        rotated_at: new Date(),
      });

      // Log audit
      await db('audit_logs').insert({
        user_id: userId,
        action: 'ROTATE_KEYS',
        resource_type: 'keys',
        details: {
          algorithms: ['kyber', 'dilithium'],
        },
        created_at: new Date(),
      });

      res.json({
        message: 'Keys rotated successfully',
        rotatedAt: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getKeyHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;

      const keyHistory = await db('key_rotation_history')
        .where({ user_id: userId })
        .select('rotated_at', 'algorithm')
        .orderBy('rotated_at', 'desc')
        .limit(10);

      res.json({ keyHistory });
    } catch (error) {
      next(error);
    }
  }

  static async getKeyInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;

      const user = await db('users')
        .where({ id: userId })
        .select(
          'key_rotated_at',
          'created_at',
          'kyber_public_key',
          'dilithium_public_key'
        )
        .first();

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({
        keyInfo: {
          keyRotationDate: user.key_rotated_at,
          accountCreationDate: user.created_at,
          algorithms: ['CRYSTALS-Kyber', 'CRYSTALS-Dilithium'],
          keySizes: {
            kyber: user.kyber_public_key.length,
            dilithium: user.dilithium_public_key.length,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
