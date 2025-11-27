import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
const router = Router();
router.get('/me', authenticateToken, UserController.getCurrentUser);
router.post('/search', authenticateToken, UserController.searchUsers);
router.post('/update', authenticateToken, UserController.updateProfile);
export default router;
