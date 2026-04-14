import { Router } from 'express';
import { connectSource, getSources, deleteSource, testConnection } from '../controllers/source.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { csrfCheck } from '../middleware/csrf.middleware.js';
import { planAwareLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/connect', csrfCheck, requireAuth, planAwareLimiter, connectSource);
router.post('/test-connection', csrfCheck, requireAuth, planAwareLimiter, testConnection);
router.get('/', requireAuth, planAwareLimiter, getSources);
router.delete('/:id', csrfCheck, requireAuth, planAwareLimiter, deleteSource);

export default router;
