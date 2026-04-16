import type { Request, Response, NextFunction } from 'express';
import { sendContactEmail } from '../services/email.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const submitContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, message } = req.body as { name: string; email: string; message: string };
    await sendContactEmail({ name, email, message });
    successResponse(res, { success: true });
  } catch (err) {
    next(err);
  }
};
