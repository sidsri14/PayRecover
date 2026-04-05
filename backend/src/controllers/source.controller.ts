import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { createPaymentSource, getPaymentSources, deletePaymentSource, validateSourceCredentials } from '../services/source.service.js';
import { logAuditAction } from '../services/audit.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { z } from 'zod';

const connectSchema = z.object({
  keyId: z.string().regex(/^rzp_(test|live)_[a-zA-Z0-9]{14,}$/, 'Invalid Razorpay Key ID'),
  keySecret: z.string().min(20).max(100),
  webhookSecret: z.string().min(20).max(256),
  name: z.string().max(100).optional(),
});

export const connectSource = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = connectSchema.safeParse(req.body);
    if (!parsed.success) return errorResponse(res, 'Invalid request body', 400);

    if (!(await validateSourceCredentials(parsed.data.keyId, parsed.data.keySecret))) {
      return errorResponse(res, 'Invalid Razorpay credentials', 401);
    }

    const source = await createPaymentSource(req.userId!, parsed.data);
    await logAuditAction(req.userId!, 'SOURCE_CREATED', 'PaymentSource', source.id, { name: source.name });
    successResponse(res, source, 201);
  } catch (err) { next(err); }
};

export const testConnection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { keyId, keySecret } = req.body;
    if (typeof keyId !== 'string' || typeof keySecret !== 'string') return errorResponse(res, 'Key ID and Secret required', 400);
    if (keyId.length > 100 || keySecret.length > 100) return errorResponse(res, 'Invalid credentials', 400);

    const ok = await validateSourceCredentials(keyId, keySecret);
    successResponse(res, { message: ok ? 'Verified!' : 'Failed' }, ok ? 200 : 401);
  } catch (err) { next(err); }
};

export const getSources = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    successResponse(res, await getPaymentSources(req.userId!));
  } catch (err) { next(err); }
};

export const deleteSource = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id || '');
    if (!id) return errorResponse(res, 'ID required', 400);
    await deletePaymentSource(req.userId!, id);
    await logAuditAction(req.userId!, 'SOURCE_DELETED', 'PaymentSource', id);
    successResponse(res, { deleted: true });
  } catch (err) { next(err); }
};
