import { Router } from 'express';
import { updatePlan } from '../controllers/billing.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.patch('/plan', updatePlan);

export default router;
