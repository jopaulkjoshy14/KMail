import { Request, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';


export class UserController {
static async searchUsers(req: Request, res: Response, next: NextFunction) {
try {
const q = req.body.query || req.query.query;
const userId = (req as any).user?.id;
if (!q || typeof q !== 'string' || q.length < 2) throw createError('Query at least 2 chars', 400);
const users = await User.find({ $or: [{ email: new RegExp(q, 'i') }, { name: new RegExp(q, 'i') }], _id: { $ne: userId } }).select('id email name').limit(10).lean();
res.json({ users });
} catch (err) { next(err); }
}


static async updateProfile(req: Request, res: Response, next: NextFunction) {
try {
const userId = (req as any).user?.id;
const { name, currentPassword, newPassword } = req.body;
if (!name) throw createError('Name required', 400);
const updateData: any = { name, updated_at: new Date() };
if (newPassword) {
if (!currentPassword) throw createError('Current password required', 400);
const user = await User.findById(userId).select('password_hash');
if (!user) throw createError('User not found', 404);
const isValid = await bcrypt.compare(currentPassword, user.password_hash);
if (!isValid) throw createError('Current password incorrect', 401);
updateData.password_hash = await bcrypt.hash(newPassword, 12);
}
await User.findByIdAndUpdate(userId, updateData);
await AuditLog.create({ user_id: userId, action: 'UPDATE_PROFILE', resource_type: 'user', resource_id: userId, details: { name_updated: true, password_updated: !!newPassword } });
res.json({ message: 'Profile updated' });
} catch (err) { next(err); }
}


static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
try {
const userId = (req as any).user?.id;
const user = await User.findById(userId).select('email name created_at key_rotated_at').lean();
if (!user) throw createError('User not found', 404);
res.json({ user });
} catch (err) { next(err); }
}
}
