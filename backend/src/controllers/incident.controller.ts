import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * GET /api/incidents  — all incidents across all monitors for this user (paginated, latest first)
 */
export const getIncidents = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Collect all monitor IDs for this user
    const monitors = await prisma.monitor.findMany({
      where: { project: { userId: req.userId } },
      select: { id: true },
    });
    const monitorIds = monitors.map(m => m.id);

    const incidents = await prisma.incident.findMany({
      where: { monitorId: { in: monitorIds } },
      orderBy: { startedAt: 'desc' },
      take: 50,
      include: {
        monitor: { select: { url: true, method: true } },
      },
    });

    successResponse(res, incidents);
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

    // Verify ownership
    const monitor = await prisma.monitor.findFirst({
      where: { id, project: { userId: req.userId } },
    });
    if (!monitor) {
      errorResponse(res, 'Monitor not found', 404);
      return;
    }

    const incidents = await prisma.incident.findMany({
      where: { monitorId: id },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });

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
    const incident = await prisma.incident.findFirst({
      where: {
        id: req.params.id,
        monitor: { project: { userId: req.userId } },
      },
    });

    if (!incident) {
      errorResponse(res, 'Incident not found', 404);
      return;
    }

    if (incident.resolvedAt) {
      errorResponse(res, 'Incident is already resolved', 400);
      return;
    }

    const now = new Date();
    const durationSecs = Math.round((now.getTime() - incident.startedAt.getTime()) / 1000);

    const updated = await prisma.incident.update({
      where: { id: incident.id },
      data: { resolvedAt: now, durationSecs },
    });

    successResponse(res, updated);
  } catch (error) {
    next(error);
  }
};
