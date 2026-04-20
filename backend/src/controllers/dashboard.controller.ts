import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { getFullDashboardStats, getInvoiceMetrics } from '../services/payment.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await getFullDashboardStats(req.userId!);
    successResponse(res, stats);
  } catch (err) { next(err); }
};

export const getMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const metrics = await getInvoiceMetrics(req.userId!);
    successResponse(res, metrics);
  } catch (err) { next(err); }
};
