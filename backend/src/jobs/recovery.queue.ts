import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Shared Redis connection for the queue (producer side).
// maxRetriesPerRequest: null is required by BullMQ.
export const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const recoveryQueue = new Queue('payment-recovery', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,              // retry the job itself up to 3 times on unexpected throws
    backoff: { type: 'exponential', delay: 10_000 },
    removeOnComplete: 200,    // keep last 200 completed jobs for inspection
    removeOnFail: 500,        // keep last 500 failed jobs for dead-letter review
  },
});

/**
 * Enqueue a recovery job for a failed payment.
 *
 * @param failedPaymentId  The FailedPayment.id to process.
 * @param delayMs          Optional delay before the job becomes active (default: 0 = immediate).
 */
export async function enqueueRecoveryJob(failedPaymentId: string, delayMs = 0): Promise<void> {
  await recoveryQueue.add(
    'process-payment',
    { failedPaymentId },
    { delay: delayMs }
  );
}
