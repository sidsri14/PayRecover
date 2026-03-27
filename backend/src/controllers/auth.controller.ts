import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { prisma } from '../utils/prisma.js'; // Needed for getMe

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await AuthService.register(req.body);
    successResponse(res, data, 201);
  } catch (error: any) {
    if (error.message === 'User already exists') {
      errorResponse(res, error.message, 400);
    } else {
      next(error);
    }
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await AuthService.login(req.body);
    successResponse(res, data, 200);
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      errorResponse(res, error.message, 401);
    } else {
      next(error);
    }
  }
};

export const getMe = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    // We keep getMe here or move to user.service, but it's simple enough:
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, createdAt: true },
    });

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    successResponse(res, user, 200);
  } catch (error) {
    next(error);
  }
};
