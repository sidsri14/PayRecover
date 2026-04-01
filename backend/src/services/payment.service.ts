import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma.js';
import { AuditService } from './audit.service.js';
import { RazorpayService } from './razorpay.service.js';

// Comprehensive payload type for worker processing
export type FailedPaymentWithLinks = Prisma.FailedPaymentGetPayload<{
  include: { recoveryLinks: { orderBy: { createdAt: 'desc' }, take: 1 } }
}>;

const ZERO = {
  failedAmount: 0,
  recoveredAmount: 0,
  recoveryRate: 0,
  recoveredThisWeek: 0,
  recoveredThisMonth: 0,
  recoveredViaLink: 0,
};

export class PaymentService {
  /**
   * Syncs a payment from Razorpay's webhook into our FailedPayment tracking system.
   * Ensures idempotency via the Razorpay payment ID.
   */
  static async syncFailedPayment(payload: any) {
    const payment = payload.payment.entity;
    const { id: paymentId, email, contact, amount, currency, order_id, notes, status, error_code, error_description } = payment;

    // Standardize currency/amount for display (Razorpay uses paise/cents)
    const normalizedAmount = amount / 100;

    return prisma.failedPayment.upsert({
      where: { paymentId },
      update: {
        status: status === 'failed' ? 'pending' : status,
        metadata: JSON.stringify({ error_code, error_description, notes }),
      },
      create: {
        paymentId,
        orderId: order_id,
        userId: payload.userId || 'system', // Default if internal link fails
        customerEmail: email || 'unknown@example.com',
        customerPhone: contact,
        customerName: notes?.customer_name,
        amount: normalizedAmount,
        currency: currency || 'INR',
        status: 'pending',
        metadata: JSON.stringify({ error_code, error_description, notes }),
        nextRetryAt: new Date(Date.now() + 60 * 60 * 1000), // First retry in 1hr
      },
    });
  }

  static async markRecovered(failedPaymentId: string, via: 'link' | 'external' = 'link') {
    await prisma.failedPayment.update({
      where: { id: failedPaymentId },
      data: { status: 'recovered', recoveredAt: new Date(), recoveredVia: via },
    });
    
    // Log the success audit trail
    await AuditService.logAction('PAYMENT_RECOVERED', failedPaymentId, { via });
  }

  static async markAbandoned(failedPaymentId: string) {
    await prisma.failedPayment.update({
      where: { id: failedPaymentId },
      data: { status: 'abandoned' },
    });
    await AuditService.logAction('PAYMENT_ABANDONED', failedPaymentId);
  }

  static async getPendingForRetry(): Promise<FailedPaymentWithLinks[]> {
    const lockExpiry = new Date(Date.now() - 30 * 60 * 1000); // 30 min lock expiry
    const now = new Date();

    // 1. Find payments that are due and not locked (or lock expired)
    const candidates = await prisma.failedPayment.findMany({
      where: {
        status: { in: ['pending', 'retrying'] },
        retryCount: { lt: 3 },
        nextRetryAt: { lte: now },
        user: { plan: { equals: 'paid' } },
        OR: [
          { lockedAt: null },
          { lockedAt: { lt: lockExpiry } },
        ],
      },
      select: { id: true },
      take: 20,
    });

    if (candidates.length === 0) return [];

    const candidateIds = candidates.map(c => c.id);

    // 2. Set advisory lock
    await prisma.failedPayment.updateMany({
      where: { id: { in: candidateIds } },
      data: { lockedAt: now },
    });

    // 3. Fetch full records
    const results = await prisma.failedPayment.findMany({
      where: { id: { in: candidateIds }, lockedAt: now },
      include: {
        recoveryLinks: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    return results as FailedPaymentWithLinks[];
  }

  static async releaseLock(id: string) {
    await prisma.failedPayment.update({
      where: { id },
      data: { lockedAt: null },
    });
  }

  static async recordReminderAndIncrementRetry(
    failedPaymentId: string,
    dayOffset: number,
    type: string
  ): Promise<number> {
    const payment = await prisma.failedPayment.findUnique({
      where: { id: failedPaymentId },
      select: { retryCount: true },
    });
    
    const currentCount = payment?.retryCount ?? 0;
    const newCount = currentCount + 1;
    const delayMs = PaymentService.RETRY_DELAYS_MS[currentCount] ?? null;
    const nextRetryAt = delayMs !== null ? new Date(Date.now() + delayMs) : null;

    await prisma.$transaction([
      prisma.reminder.create({
        data: { failedPaymentId, dayOffset, type, status: 'sent' },
      }),
      prisma.failedPayment.update({
        where: { id: failedPaymentId },
        data: {
          retryCount: newCount,
          lastRetryAt: new Date(),
          nextRetryAt,
          status: 'retrying',
          lockedAt: null, // release advisory lock
        },
      }),
    ]);

    return newCount;
  }

  static async createRecoveryLink(failedPaymentId: string, url: string) {
    return prisma.recoveryLink.create({
      data: { failedPaymentId, url },
    });
  }

  static async triggerManualRetry(userId: string, failedPaymentId: string) {
    const payment = await prisma.failedPayment.findFirst({
      where: { id: failedPaymentId, userId },
    });
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (!['pending', 'retrying'].includes(payment.status)) {
      throw new Error('Payment cannot be retried in its current state');
    }
    
    await prisma.failedPayment.update({
      where: { id: failedPaymentId },
      data: { nextRetryAt: new Date() },
    });
  }

  static async getMetrics(userId: string) {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [totalAgg, recoveredAgg, weekAgg, monthAgg, viaLinkAgg] = await Promise.all([
        prisma.failedPayment.aggregate({ where: { userId }, _sum: { amount: true } }),
        prisma.failedPayment.aggregate({ where: { userId, status: 'recovered' }, _sum: { amount: true } }),
        prisma.failedPayment.aggregate({ where: { userId, status: 'recovered', recoveredAt: { gte: weekAgo } }, _sum: { amount: true } }),
        prisma.failedPayment.aggregate({ where: { userId, status: 'recovered', recoveredAt: { gte: monthAgo } }, _sum: { amount: true } }),
        prisma.failedPayment.aggregate({ where: { userId, status: 'recovered', recoveredVia: 'link' }, _sum: { amount: true } }),
      ]);

      const failedAmount = totalAgg._sum.amount ?? 0;
      const recoveredAmount = recoveredAgg._sum.amount ?? 0;
      const recoveryRate = failedAmount > 0 ? recoveredAmount / failedAmount : 0;

      return {
        failedAmount,
        recoveredAmount,
        recoveryRate: Math.round(recoveryRate * 1000) / 1000,
        recoveredThisWeek: weekAgg._sum.amount ?? 0,
        recoveredThisMonth: monthAgg._sum.amount ?? 0,
        recoveredViaLink: viaLinkAgg._sum.amount ?? 0,
      };
    } catch (error) {
      console.error('[PaymentService.getMetrics Failure]', error);
      return ZERO;
    }
  }

  private static readonly RETRY_DELAYS_MS: (number | null)[] = [
    24 * 60 * 60 * 1000,  // after retry 0 → wait 24h
    72 * 60 * 60 * 1000,  // after retry 1 → wait 72h
    null,                  // after retry 2 → no more retries
  ];
}
