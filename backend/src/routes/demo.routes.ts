import { Router } from 'express';
import { simulateFailure, simulateSuccess } from '../controllers/demo.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { csrfCheck } from '../middleware/csrf.middleware.js';

const router = Router();

// Demo routes are used for onboarding/testing and are safe under requireAuth

router.post('/simulate-failure', csrfCheck, requireAuth, simulateFailure);
router.post('/simulate-success/:id', csrfCheck, requireAuth, simulateSuccess);

export default router;
