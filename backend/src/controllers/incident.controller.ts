import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * GET /api/incidents  — all incidents across all monitors for this user
 */
export const getIncidents = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incidents: any[] = await prisma.$queryRaw`
      SELECT i.*, m.url, m."method"
      FROM "Incident" i
      JOIN "Monitor" m ON i."monitorId" = m.id
      JOIN "Project" p ON m."projectId" = p.id
      WHERE p."userId" = ${req.userId}
      ORDER BY i."startedAt" DESC
      LIMIT 50
    `;

    // Map to include monitor object for frontend compatibility if needed
    const formatted = incidents.map(inc => ({
      ...inc,
      monitor: { url: inc.url, method: inc.method }
    }));

    successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/monitors/:id/incidents — incidents for a specific monitor
 */
export const getMonitorIncidents = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const incidents: any[] = await prisma.$queryRaw`
      SELECT i.*
      FROM "Incident" i
      JOIN "Monitor" m ON i."monitorId" = m.id
      JOIN "Project" p ON m."projectId" = p.id
      WHERE i."monitorId" = ${id} AND p."userId" = ${req.userId}
      ORDER BY i."startedAt" DESC
      LIMIT 20
    `;

    successResponse(res, incidents);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/incidents/:id/resolve  — manually resolve an open incident
 */
export const resolveIncident = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // 1. Find the incident and check ownership
    const incidents: any[] = await prisma.$queryRaw`
      SELECT i.id, i."startedAt", i."resolvedAt"
      FROM "Incident" i
      JOIN "Monitor" m ON i."monitorId" = m.id
      JOIN "Project" p ON m."projectId" = p.id
      WHERE i.id = ${id} AND p."userId" = ${req.userId}
      LIMIT 1
    `;

    if (incidents.length === 0) {
      errorResponse(res, 'Incident not found', 404);
      return;
    }

    const inc = incidents[0];
    if (inc.resolvedAt) {
      errorResponse(res, 'Incident is already resolved', 400);
      return;
    }

    const resolvedAt = new Date();
    const startedAt = new Date(inc.startedAt);
    const durationSecs = Math.floor((resolvedAt.getTime() - startedAt.getTime()) / 1000);

    await prisma.$executeRaw`
      UPDATE "Incident" 
      SET "resolvedAt" = ${resolvedAt}, "durationSecs" = ${durationSecs}
      WHERE id = ${id}
    `;

    successResponse(res, { id, resolvedAt, durationSecs });
  } catch (error) {
    next(error);
  }
};
