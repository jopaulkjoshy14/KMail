import { Router } from 'express';
import { MessageController } from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/send', authenticateToken, MessageController.sendMessage);
router.get('/inbox', authenticateToken, MessageController.getInbox);
router.get('/sent', authenticateToken, MessageController.getSentMessages);
router.get('/stats', authenticateToken, MessageController.getMessageStats);
router.get('/:id', authenticateToken, MessageController.getMessage);
router.delete('/:id', authenticateToken, MessageController.deleteMessage);

export default router;
