import { Router } from 'express';
import { getIncidents, resolveIncident } from '../controllers/incident.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getIncidents);
router.post('/:id/resolve', resolveIncident);

export default router;
