import { prisma } from '../utils/prisma.js';

export class AuditService {
  /**
   * Logs an action to the persistent audit trail.
   */
  static async logAction(action: string, resourceId: string | null = null, details: any = null, userId: string = 'system') {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          resourceId,
          resource: 'FailedPayment', // predominantly used for failed payments
          details: details ? JSON.stringify(details) : null,
        },
      });
    } catch (error) {
      console.error('[AuditService.logAction Failure]', error);
    }
  }
}
