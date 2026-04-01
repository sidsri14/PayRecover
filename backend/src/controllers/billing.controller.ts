import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { prisma } from '../utils/prisma.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { AuditService } from '../services/audit.service.js';

export const updatePlan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { plan } = req.body;
    
    if (!['free', 'paid'].includes(plan)) {
      errorResponse(res, 'Invalid plan type', 400);
      return;
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { plan },
      select: { id: true, email: true, plan: true },
    });

    await AuditService.logAction('PLAN_UPDATED', user.id, { plan }, req.userId!);
    
    successResponse(res, { 
      message: `Account successfully updated to ${plan} plan`,
      user 
    });
  } catch (error) {
    next(error);
  }
};
