import type { Job } from 'bullmq';
import pino from 'pino';
import { prisma } from '../utils/prisma.js';
import { RazorpayService } from '../services/RazorpayService.js';
import { EmailService } from '../services/EmailService.js';
import { recoveryQueue } from './recovery.queue.js';
import { RETRY_DELAYS_MS } from '../services/payment.service.js';

const logger = pino({ transport: { target: 'pino-pretty', options: { colorize: true } } });

export interface RecoveryJobData {
  failedPaymentId: string;
}

/**
 * BullMQ Processor for payment recovery jobs.
 * Day 1-2 of MVP Roadmap Implementation.
 */
export async function processRecoveryJob(job: Job<RecoveryJobData>): Promise<void> {
  const { failedPaymentId } = job.data;

  // 1. Eligibility & Race Condition Guard
  const payment = await prisma.failedPayment.findUnique({
    where: { id: failedPaymentId },
    include: { user: true }
  });

  if (!payment || payment.status === 'recovered' || payment.status === 'abandoned') {
    logger.info({ failedPaymentId }, 'Payment no longer eligible — skipping');
    return;
  }

  // 2. Advisory Lock
  await prisma.failedPayment.update({
    where: { id: failedPaymentId },
    data: { lockedAt: new Date(), status: 'retrying' }
  });

  try {
    // 3. Create/Fetch Recovery Link
    // MVP: Always create a fresh link for simplicity, or reuse if not expired
    const link = await RazorpayService.createPaymentLink(payment);
    
    // Store link in DB with 7-day expiration
    await prisma.recoveryLink.create({
      data: {
        failedPaymentId,
        url: link,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // 4. Send Email (Initial or Reminder)
    await EmailService.sendRecoveryEmail(payment, link, payment.retryCount);

    // 5. Schedule Next Retry or Abandon
    if (payment.retryCount < 2) {
      const nextDelay = RETRY_DELAYS_MS[payment.retryCount] as number;
      if (nextDelay === undefined) throw new Error('Invalid retry delay configuration');

      await recoveryQueue.add(
        'payment-recovery',
        { failedPaymentId },
        { delay: nextDelay }
      );
      
      // Update state for next cycle
      await prisma.failedPayment.update({
        where: { id: failedPaymentId },
        data: {
          retryCount: { increment: 1 },
          lastRetryAt: new Date(),
          nextRetryAt: new Date(Date.now() + nextDelay),
          lockedAt: null
        }
      });
      logger.info({ failedPaymentId, retryCount: payment.retryCount + 1 }, 'Scheduled next reminder');
    } else {
      // Final attempt reached
      await prisma.failedPayment.update({
        where: { id: failedPaymentId },
        data: { status: 'abandoned', lockedAt: null }
      });
      logger.info({ failedPaymentId }, 'Max retries reached — abandoned');
    }

  } catch (err) {
    logger.error({ failedPaymentId, err }, 'Failed to process recovery job');
    // Release lock on error so BullMQ retry (or next pass) can pick it up
    await prisma.failedPayment.update({
      where: { id: failedPaymentId },
      data: { lockedAt: null }
    });
    throw err; // ensure BullMQ knows the job failed
  }
}
