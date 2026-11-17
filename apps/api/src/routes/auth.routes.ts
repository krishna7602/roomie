import { Router } from 'express';
import { loginSchema, registerSchema, updateProfileSchema } from '@roomie/shared';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

const router = Router();

router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.get('/me', authenticate, AuthController.getMe);
router.put('/me', authenticate, validateBody(updateProfileSchema), AuthController.updateMe);

export default router;
