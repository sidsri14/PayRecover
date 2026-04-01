import { sendPaymentFailedEmail, sendPaymentReminderEmail } from './email.service.js';

/**
 * Service for sending recovery emails at various stages of the lifecycle.
 * Day 1-2 of MVP Roadmap Implementation.
 */
export class EmailService {
  /**
   * Send the appropriate email depending on which attempt this is.
   *
   * @param failedPayment  The FailedPayment model (includes customer details)
   * @param link           The Razorpay recovery link
   * @param retryNumber    0 for initial failure, 1+ for follow-up reminders
   */
  static async sendRecoveryEmail(failedPayment: any, link: string, retryNumber: number): Promise<void> {
    const params = {
      customerName: failedPayment.customerName || undefined,
      amount: failedPayment.amount,
      currency: failedPayment.currency || 'INR',
      paymentLink: link,
      paymentId: failedPayment.paymentId,
    };

    if (retryNumber === 0) {
      // Immediate notification
      await sendPaymentFailedEmail(failedPayment.customerEmail, params);
    } else {
      // Follow-up reminders (24h or 72h)
      // dayOffset = ([0, 1, 3][retryNumber] || 3)
      const dayOffset = retryNumber === 1 ? 1 : 3;
      await sendPaymentReminderEmail(failedPayment.customerEmail, {
        ...params,
        dayOffset,
      });
    }
  }
}
