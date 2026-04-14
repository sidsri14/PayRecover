import { Router } from 'express';
import { simulateFailure, simulateSuccess } from '../controllers/demo.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { csrfCheck } from '../middleware/csrf.middleware.js';

const router = Router();

// Gate demo routes in production
router.use((_req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Demo routes are disabled in production' });
  }
  next();
});

router.post('/simulate-failure', csrfCheck, requireAuth, simulateFailure);
router.post('/simulate-success/:id', csrfCheck, requireAuth, simulateSuccess);

export default router;
