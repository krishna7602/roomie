import { Router } from 'express';
import { sendMessageSchema } from '@roomie/shared';
import { ChatController } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/conversations', ChatController.getConversations);
router.post('/direct', ChatController.startDirectChat);
router.get('/conversations/:id/messages', ChatController.getMessages);
router.post('/conversations/messages', validateBody(sendMessageSchema), ChatController.sendMessage);

export default router;
