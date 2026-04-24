import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logAuditAction } from '../services/audit.service.js';

const clientCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email('Invalid email address').max(254),
  phone: z.string().max(30).optional(),
  company: z.string().max(200).optional(),
});

export class ClientController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = clientCreateSchema.safeParse(req.body);
      if (!parsed.success) return errorResponse(res, parsed.error.issues[0]?.message ?? 'Invalid request', 400);

      const { name, email, phone, company } = parsed.data;
      const client = await prisma.client.create({
        data: { userId: req.userId!, name, email, phone, company }
      });
      void logAuditAction(req.userId!, 'CLIENT_CREATE', 'Client', client.id, { name, email });
      successResponse(res, client);
    } catch (err) {
      next(err);
    }
  }

  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const clients = await prisma.client.findMany({
        where: { userId: req.userId! },
        orderBy: { name: 'asc' }
      });
      successResponse(res, clients);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const userId = String(req.userId);

      const updateSchema = clientCreateSchema.partial();
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) return errorResponse(res, parsed.error.issues[0]?.message ?? 'Invalid request', 400);

      // Atomic ownership check + update — no TOCTOU gap between findFirst and update
      const result = await prisma.client.updateMany({
        where: { id, userId },
        data: parsed.data,
      });
      if (result.count === 0) return errorResponse(res, 'Client not found', 404);

      const client = await prisma.client.findUnique({ where: { id } });
      void logAuditAction(req.userId!, 'CLIENT_UPDATE', 'Client', id, parsed.data);
      successResponse(res, client);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const userId = String(req.userId);
      const count = await prisma.client.deleteMany({ where: { id, userId } });
      if (count.count === 0) return errorResponse(res, 'Client not found', 404);
      void logAuditAction(userId, 'CLIENT_DELETE', 'Client', id);
      successResponse(res, { success: true });
    } catch (err) {
      next(err);
    }
  }
}
