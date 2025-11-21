import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { createError } from '../middleware/errorHandler';

export class UserController {
  static async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.query;
      const userId = (req as any).user?.id;

      if (!query || typeof query !== 'string') {
        throw createError('Search query is required', 400);
      }

      if (query.length < 2) {
        throw createError('Search query must be at least 2 characters long', 400);
      }

      const users = await db('users')
        .where(function() {
          this.where('email', 'ilike', `%${query}%`)
            .orWhere('name', 'ilike', `%${query}%`);
        })
        .andWhereNot('id', userId) // Exclude current user
        .select('id', 'email', 'name')
        .limit(10);

      res.json({ users });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { name, currentPassword, newPassword } = req.body;

      if (!name) {
        throw createError('Name is required', 400);
      }

      if (newPassword && newPassword.length < 8) {
        throw createError('New password must be at least 8 characters long', 400);
      }

      const updateData: any = {
        name,
        updated_at: new Date(),
      };

      // If password change is requested
      if (newPassword) {
        if (!currentPassword) {
          throw createError('Current password is required to change password', 400);
        }

        const user = await db('users')
          .where({ id: userId })
          .select('password_hash')
          .first();

        if (!user) {
          throw createError('User not found', 404);
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValidPassword) {
          throw createError('Current password is incorrect', 401);
        }

        updateData.password_hash = await bcrypt.hash(newPassword, 12);
      }

      await db('users')
        .where({ id: userId })
        .update(updateData);

      // Log profile update
      await db('audit_logs').insert({
        user_id: userId,
        action: 'UPDATE_PROFILE',
        resource_type: 'user',
        resource_id: userId,
        details: {
          name_updated: true,
          password_updated: !!newPassword,
        },
        created_at: new Date(),
      });

      res.json({ 
        message: 'Profile updated successfully',
        updated: {
          name: true,
          password: !!newPassword,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;

      const user = await db('users')
        .where({ id: userId })
        .select('id', 'email', 'name', 'created_at', 'key_rotated_at', 'updated_at')
        .first();

      if (!user) {
        throw createError('User not found', 404);
      }

      // Get message statistics
      const [inboxCount, sentCount] = await Promise.all([
        db('messages').where({ recipient_id: userId }).count('* as count').first(),
        db('messages').where({ sender_id: userId }).count('* as count').first(),
      ]);

      res.json({
        user,
        statistics: {
          inboxMessages: parseInt(inboxCount?.count as string) || 0,
          sentMessages: parseInt(sentCount?.count as string) || 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
      const offset = (page - 1) * limit;

      const logs = await db('audit_logs')
        .where({ user_id: userId })
        .select('action', 'resource_type', 'resource_id', 'details', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      const total = await db('audit_logs')
        .where({ user_id: userId })
        .count('* as count')
        .first();

      res.json({
        logs,
        pagination: {
          page,
          limit,
          total: parseInt(total?.count as string) || 0,
          pages: Math.ceil((parseInt(total?.count as string) || 0) / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
          }
