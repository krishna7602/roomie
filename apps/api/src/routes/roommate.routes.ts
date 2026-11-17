import { Router } from 'express';
import { swipeActionSchema } from '@roomie/shared';
import { RoommateController } from '../controllers/roommate.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/candidates', RoommateController.getCandidates);
router.post('/swipe', validateBody(swipeActionSchema), RoommateController.swipe);
router.get('/matches', RoommateController.getMatches);
router.get('/:id', RoommateController.getRoommateById);

export default router;
