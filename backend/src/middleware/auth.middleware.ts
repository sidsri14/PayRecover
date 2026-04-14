import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../utils/prisma.js';

export type AuthRequest = Request & {
  userId?: string;
  userPlan?: string; // Set by requireAuth; used by planAwareLimiter
};

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  // Priority 1: Cookie
  let token = req.cookies?.token;

  // Priority 2: Authorization Header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    
    // CRITICAL: Verify user still exists in the database 
    // This handles cases where the DB was migrated/reset but the user has an old JWT
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, plan: true }
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'Unauthorized: User no longer exists' });
      return;
    }

    req.userId = decoded.userId;
    req.userPlan = user.plan;
    next();
  } catch (error) {
    // Log invalid token attempts for security monitoring
    const { logAuditAction } = await import('../services/audit.service.js');
    await logAuditAction('system', 'UNAUTHORIZED_ACCESS_ATTEMPT', 'Auth', 'none', { 
      ip: req.ip, 
      userAgent: req.headers['user-agent'],
      error: 'Invalid token'
    }).catch(() => {});

    res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
  }
};
