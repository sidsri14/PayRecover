import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { prisma } from '../utils/prisma.js';
import { successResponse } from '../utils/apiResponse.js';

export const simulateFailure = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const paymentId = `pay_demo_${Math.random().toString(36).substring(7)}`;
    
    const payment = await prisma.failedPayment.create({
      data: {
        userId: req.userId!,
        paymentId: paymentId,
        orderId: `order_${Math.random().toString(36).substring(7)}`,
        customerName: 'Demo Customer',
        customerEmail: 'demo@example.com',
        customerPhone: '+919999999999',
        amount: 2999,
        currency: 'INR',
        status: 'pending',
        metadata: JSON.stringify({ 
          error_code: 'BAD_REQUEST_ERROR', 
          error_description: 'Simulation of a failed payment for onboarding test.' 
        }),
        nextRetryAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    successResponse(res, { 
      message: 'Demo failed payment created successfully',
      payment 
    }, 201);
  } catch (error) {
    next(error);
  }
};
