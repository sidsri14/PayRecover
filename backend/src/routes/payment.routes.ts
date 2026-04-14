import { Router } from 'express';
import { getPayments, getPayment, manualRetry, exportPayments } from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { planAwareLimiter } from '../middleware/rateLimit.middleware.js';
import { csrfCheck } from '../middleware/csrf.middleware.js';

const router = Router();

router.get('/', requireAuth, planAwareLimiter, getPayments);
router.get('/export', requireAuth, planAwareLimiter, exportPayments);
router.get('/:id', requireAuth, planAwareLimiter, getPayment);
router.post('/:id/retry', csrfCheck, requireAuth, planAwareLimiter, manualRetry);

export default router;
