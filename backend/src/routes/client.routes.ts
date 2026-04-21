import { Router } from 'express';
import { ClientController } from '../controllers/client.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { csrfCheck } from '../middleware/csrf.middleware.js';

const router = Router();

router.post('/', requireAuth, csrfCheck, ClientController.create);
router.get('/', requireAuth, ClientController.list);
router.patch('/:id', requireAuth, csrfCheck, ClientController.update);
router.delete('/:id', requireAuth, csrfCheck, ClientController.delete);

export default router;
