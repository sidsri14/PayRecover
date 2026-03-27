import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Fix P1: Remove duplicate logging
  console.error(`[Error] ${err.message}`, { stack: err.stack });
  
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Section 2: Error Hygiene (Hide details in prod for 500s)
  const message = (isProduction && statusCode === 500) 
    ? 'Internal Server Error' 
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
