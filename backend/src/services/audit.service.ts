import { prisma } from '../utils/prisma.js';

/**
 * Logs an action to the persistent audit trail.
 */
export const logAuditAction = async (
  userId: string,
  action: string,
  resource: string | null = null,
  resourceId: string | null = null,
  details: any = null
) => {
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
  } catch (err) {
    console.error('[AuditService Failure]', err);
  }
};
