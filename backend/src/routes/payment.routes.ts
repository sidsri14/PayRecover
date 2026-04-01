import { Router } from 'express';
import { getPayments, getPayment, manualRetry } from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { apiLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.use(requireAuth);
router.use(apiLimiter);

router.get('/', getPayments);
router.get('/:id', getPayment);
router.post('/:id/retry', manualRetry);

export default router;
