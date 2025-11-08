import express from 'express';
import { authJwt } from '../middleware/authJwt.js';
import { sendMessage } from '../controllers/messageController.js';

const router = express.Router();

router.post('/send', authJwt, sendMessage);
export default router;
