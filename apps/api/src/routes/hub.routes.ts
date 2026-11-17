import { Router } from 'express';
import { createChoreSchema, createExpenseSchema } from '@roomie/shared';
import { HubController } from '../controllers/hub.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

const router = Router();

router.use(authenticate);

// Chores
router.get('/chores', HubController.getChores);
router.post('/chores', validateBody(createChoreSchema), HubController.createChore);
router.patch('/chores/:id', HubController.updateChoreStatus);
router.delete('/chores/:id', HubController.deleteChore);

// Expenses
router.get('/expenses', HubController.getExpenses);
router.post('/expenses', validateBody(createExpenseSchema), HubController.createExpense);
router.patch('/expenses/:id/settle', HubController.settleExpense);

export default router;
