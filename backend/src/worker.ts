import 'dotenv/config';
import pino from 'pino';
import { prisma } from './utils/prisma.js';
import { PaymentService } from './services/payment.service.js';
import { RazorpayService } from './services/razorpay.service.js';
import { sendPaymentFailedEmail, sendPaymentReminderEmail } from './services/email.service.js';
import { AuditService } from './services/audit.service.js';

const RECOVERY_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const EXPIRY_DAYS = 7;

const logger = pino({
  transport: { target: 'pino-pretty', options: { colorize: true } },
});

let isShuttingDown = false;
let recoveryHandle: ReturnType<typeof setTimeout> | null = null;

const processRecoveryQueue = async (): Promise<void> => {
  if (isShuttingDown) return;

  logger.info('Recovery worker tick started');

  try {
    // 1. Mark payments older than EXPIRY_DAYS as expired
    const expiryThreshold = new Date(Date.now() - EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const expired = await prisma.failedPayment.findMany({
      where: { status: 'pending', createdAt: { lt: expiryThreshold } },
    });
    for (const p of expired) {
      await PaymentService.markExpired(p.id);
      logger.info({ paymentId: p.paymentId }, 'Payment expired');
    }
    if (expired.length > 0) {
      logger.info(`Marked ${expired.length} payment(s) as expired`);
    }

    // 2. Process retry queue
    const pending = await PaymentService.getPendingForRetry();
    logger.info(`${pending.length} payment(s) ready for retry`);

    for (const payment of pending) {
      try {
        // Generate payment link if not already set
        let paymentLink = payment.paymentLink;
        if (!paymentLink) {
          paymentLink = await RazorpayService.createPaymentLink({
            amount: payment.amount,
            currency: payment.currency,
            customerName: payment.customerName ?? undefined,
            customerEmail: payment.customerEmail,
            customerPhone: payment.customerPhone ?? undefined,
            description: `Retry payment${payment.orderId ? ` for order ${payment.orderId}` : ''}`,
            referenceId: payment.id,
          });
        }

        // Send correct email based on retry sequence
        const dayOffset = payment.retryCount === 0 ? 0 : payment.retryCount === 1 ? 2 : 5;

        if (payment.retryCount === 0) {
          await sendPaymentFailedEmail(payment.customerEmail, {
            customerName: payment.customerName ?? undefined,
            amount: payment.amount,
            currency: payment.currency,
            paymentLink,
            paymentId: payment.paymentId,
          });
        } else {
          await sendPaymentReminderEmail(payment.customerEmail, {
            customerName: payment.customerName ?? undefined,
            amount: payment.amount,
            currency: payment.currency,
            paymentLink,
            dayOffset,
            paymentId: payment.paymentId,
          });
        }

        await PaymentService.recordReminder(payment.id, dayOffset, 'email');
        await PaymentService.incrementRetry(payment.id, paymentLink);
        await AuditService.log(
          payment.userId,
          'PAYMENT_REMINDER_SENT',
          'FailedPayment',
          payment.id,
          { retryCount: payment.retryCount, dayOffset, email: payment.customerEmail }
        );

        logger.info({ paymentId: payment.paymentId, retryCount: payment.retryCount }, 'Reminder sent');
      } catch (err) {
        logger.error({ paymentId: payment.paymentId, err }, 'Failed to process payment retry');
      }
    }
  } catch (error) {
    logger.error(error, 'Recovery queue processing error');
  } finally {
    if (!isShuttingDown) {
      recoveryHandle = setTimeout(processRecoveryQueue, RECOVERY_INTERVAL_MS);
    }
  }
};

const shutdown = async (signal: string): Promise<void> => {
  logger.info(`Shutting down worker (${signal})`);
  isShuttingDown = true;
  if (recoveryHandle) clearTimeout(recoveryHandle);
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

logger.info('RecoverPay Worker v1.0 — started');
processRecoveryQueue();
