import { prisma } from '../utils/prisma.js';
import { StripeBillingService } from './StripeBillingService.js';

export class BillingService {
  static async createSubscription(userId: string, plan: 'starter' | 'pro') {
    return StripeBillingService.createCheckoutSession(userId, plan);
  }

  static async getUserSubscription(userId: string) {
    return prisma.subscription.findFirst({
      where: { userId, status: { in: ['active', 'authenticated'] } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
