import { prisma } from '../utils/prisma.js';

export class AuditService {
  /**
   * Logs an action to the persistent audit trail.
   */
  static async logAction(
    userId: string,
    action: string,
    resource: string | null = null,
    resourceId: string | null = null,
    details: any = null
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId,
          details: details ? JSON.stringify(details) : null,
        },
      });
    } catch (error) {
      console.error('[AuditService.logAction Failure]', error);
    }
  }
}
