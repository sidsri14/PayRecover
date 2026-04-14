import { Router } from 'express';
import { getMyOrganizations, createOrganization, getOrgMembers, inviteUser } from '../controllers/team.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { planAwareLimiter } from '../middleware/rateLimit.middleware.js';
import { csrfCheck } from '../middleware/csrf.middleware.js';

import { validateRequest } from '../middleware/validate.middleware.js';
import { createOrganizationSchema, inviteUserSchema } from '../validators/team.validator.js';

const router = Router();

router.get('/my', requireAuth, planAwareLimiter, getMyOrganizations);
router.post('/', csrfCheck, requireAuth, planAwareLimiter, validateRequest(createOrganizationSchema), createOrganization);
router.get('/:orgId/members', requireAuth, planAwareLimiter, getOrgMembers);
router.post('/:orgId/invite', csrfCheck, requireAuth, planAwareLimiter, validateRequest(inviteUserSchema), inviteUser);

export default router;
