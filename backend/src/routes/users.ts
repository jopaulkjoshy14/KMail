import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/search', authenticateToken, UserController.searchUsers);
router.get('/profile', authenticateToken, UserController.getProfile);
router.put('/profile', authenticateToken, UserController.updateProfile);
router.get('/audit-logs', authenticateToken, UserController.getAuditLogs);

export default router;
