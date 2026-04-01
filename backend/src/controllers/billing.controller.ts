import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { prisma } from '../utils/prisma.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logAuditAction } from '../services/audit.service.js';

export const updatePlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { plan } = req.body;
    if (!['free', 'paid'].includes(plan)) return errorResponse(res, 'Invalid plan', 400);

    const u = await prisma.user.update({
      where: { id: req.userId },
      data: { plan },
      select: { id: true, email: true, plan: true },
    });

    await logAuditAction(req.userId!, 'PLAN_UPDATED', 'User', u.id, { plan });
    successResponse(res, { message: `Updated to ${plan}`, user: u });
  } catch (err) { next(err); }
};
