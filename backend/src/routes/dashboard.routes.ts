import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { apiLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.use(requireAuth);
router.use(apiLimiter);

router.get('/stats', getDashboardStats);

export default router;
