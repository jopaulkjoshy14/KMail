import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { db } from '../config/database';

const router = Router();

// Search users by email or name
router.get('/search', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      throw createError('Search query is required', 400);
    }

    const users = await db('users')
      .where('email', 'ilike', `%${query}%`)
      .orWhere('name', 'ilike', `%${query}%`)
      .select('id', 'email', 'name')
      .limit(10);

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { name } = req.body;

    if (!name) {
      throw createError('Name is required', 400);
    }

    await db('users')
      .where({ id: userId })
      .update({
        name,
        updated_at: new Date(),
      });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
