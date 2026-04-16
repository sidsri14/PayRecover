import { Router } from 'express';
import { submitContact } from '../controllers/contact.controller.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { contactSchema } from '../validators/contact.validator.js';

const router = Router();

// Public route — no auth, no CSRF (rate-limited instead)
router.post('/', authLimiter, validateRequest(contactSchema), submitContact);

export default router;
