import { Router } from 'express';
import { KeyController } from '../controllers/keyController';
import { authenticateToken } from '../middleware/auth';
const router = Router();
router.get('/public/:email', KeyController.getPublicKey);
router.post('/rotate', authenticateToken, KeyController.rotateKeys);
export default router;
