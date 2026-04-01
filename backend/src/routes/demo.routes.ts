import { Router } from 'express';
import { simulateFailure } from '../controllers/demo.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.post('/simulate-failure', simulateFailure);

export default router;
