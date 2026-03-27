import { prisma } from '../utils/prisma.js';
import { validateUrlForSSRF } from '../utils/security.js';

export class MonitorService {
  private static async getDefaultProject(userId: string) {
    let project = await prisma.project.findFirst({ where: { userId } });
    if (!project) {
      project = await prisma.project.create({
        data: {
          userId,
          name: 'Default Project',
        },
      });
    }
    return project;
  }

  static async createMonitor(userId: string, data: any) {
    const { url, method, interval } = data;

    // Phase 5: SSD/SSRF Protection - Block local/private URLs at API level
    const isSafe = await validateUrlForSSRF(url);
    if (!isSafe) {
      const error = new Error('SSRF Security Violation: Local/Private URLs are not allowed.');
      (error as any).status = 403;
      throw error;
    }

    const project = await this.getDefaultProject(userId);

    // Phase 4: Enforce Quotas (Max 20 limitation)
    const count = await prisma.monitor.count({
      where: { projectId: project.id }
    });

    if (count >= 20) {
      const error = new Error('You have reached the maximum limit of 20 monitors');
      (error as any).status = 403;
      throw error;
    }

    const monitor = await prisma.monitor.create({
      data: {
        projectId: project.id,
        url,
        method,
        interval: parseInt(interval, 10),
      },
    });

    return monitor;
  }

  static async getMonitors(userId: string) {
    const project = await this.getDefaultProject(userId);
    
    // Phase 4: Implicit Ownership validation natively enclosed
    return await prisma.monitor.findMany({
      where: { projectId: project.id }
    });
  }

  static async getMonitorById(userId: string, monitorId: string) {
    const project = await this.getDefaultProject(userId);

    // Deep ownership check: Monitor must belong to the user's project
    const monitor = await prisma.monitor.findFirst({
      where: { id: monitorId, projectId: project.id },
      include: {
        logs: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });

    if (!monitor) {
      const error = new Error('Monitor not found');
      (error as any).status = 404;
      throw error;
    }

    return monitor;
  }

  static async deleteMonitor(userId: string, monitorId: string) {
    const project = await this.getDefaultProject(userId);

    const monitor = await prisma.monitor.findFirst({
      where: { id: monitorId, projectId: project.id },
    });

    if (!monitor) {
      const error = new Error('Monitor not found');
      (error as any).status = 404;
      throw error;
    }

    // Execute deletion atomically to prevent race condition locks from the background worker
    await prisma.$transaction([
      prisma.log.deleteMany({ where: { monitorId } }),
      prisma.alert.deleteMany({ where: { monitorId } }),
      prisma.monitor.delete({ where: { id: monitorId } })
    ]);

    return true;
  }
}
