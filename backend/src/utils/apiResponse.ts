import type { Response } from 'express';

export const successResponse = <T>(res: Response, data?: T, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data });
};

export const errorResponse = (res: Response, message: string, statusCode = 400) => {
  return res.status(statusCode).json({ success: false, error: message });
};
