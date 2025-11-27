import { Router } from 'express';
import { MessageController } from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';
const router = Router();
router.post('/send', authenticateToken, MessageController.sendMessage);
router.get('/inbox', authenticateToken, MessageController.getInbox);
router.delete('/:id', authenticateToken, MessageController.deleteMessage);
export default router;
