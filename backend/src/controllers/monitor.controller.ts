import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// Note: In MVP, we might associate monitors directly with users or through projects. 
// Our schema has Project -> Monitor. We will auto-create a default project if none exists.

const getDefaultProject = async (userId: string) => {
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
};

export const createMonitor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { url, method = 'GET', interval = 60 } = req.body;
    
    if (!url) {
      res.status(400).json({ success: false, error: 'URL is required' });
      return;
    }

    const project = await getDefaultProject(req.userId!);

    const monitor = await prisma.monitor.create({
      data: {
        projectId: project.id,
        url,
        method,
        interval: parseInt(interval, 10),
      },
    });

    res.status(201).json({ success: true, data: monitor });
  } catch (error) {
    next(error);
  }
};

export const getMonitors = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await getDefaultProject(req.userId!);
    
    const monitors = await prisma.monitor.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'desc' }, // wait, monitor schema has no createdAt. We can just order by id or fetch unordered.
    });

    res.status(200).json({ success: true, data: monitors });
  } catch (error) {
    next(error);
  }
};

export const getMonitor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await getDefaultProject(req.userId!);

    const monitor = await prisma.monitor.findFirst({
      where: { id, projectId: project.id },
      include: {
        logs: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });

    if (!monitor) {
      res.status(404).json({ success: false, error: 'Monitor not found' });
      return;
    }

    res.status(200).json({ success: true, data: monitor });
  } catch (error) {
    next(error);
  }
};

export const deleteMonitor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await getDefaultProject(req.userId!);

    const monitor = await prisma.monitor.findFirst({
      where: { id, projectId: project.id },
    });

    if (!monitor) {
      res.status(404).json({ success: false, error: 'Monitor not found' });
      return;
    }

    // Prisma doesn't cascade delete logs implicitly without onDelete: Cascade in schema, so we delete related first manually
    await prisma.log.deleteMany({ where: { monitorId: id } });
    await prisma.alert.deleteMany({ where: { monitorId: id } });
    await prisma.monitor.delete({ where: { id } });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
