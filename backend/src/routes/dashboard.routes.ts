import { Router } from 'express';
import { getDashboardStats, getMetrics } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { planAwareLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.use(requireAuth);
router.use(planAwareLimiter);

router.get('/stats', getDashboardStats);
router.get('/metrics', getMetrics);

export default router;
