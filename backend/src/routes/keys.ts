import { Router } from 'express';
import { KeyController } from '../controllers/keyController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/public/:email', KeyController.getPublicKey);
router.post('/rotate', authenticateToken, KeyController.rotateKeys);
router.get('/history', authenticateToken, KeyController.getKeyHistory);
router.get('/info', authenticateToken, KeyController.getKeyInfo);

export default router;
