import type { Request, Response } from 'express';
import { RazorpayService } from '../services/razorpay.service.js';
import { PaymentService } from '../services/payment.service.js';
import { AuditService } from '../services/audit.service.js';
import { prisma } from '../utils/prisma.js';

export const handleRazorpayWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['x-razorpay-signature'] as string | undefined;

  if (!signature) {
    res.status(400).json({ error: 'Missing signature' });
    return;
  }

  // req.body is a Buffer because this route uses express.raw()
  const rawBody = (req.body as Buffer).toString('utf8');

  if (!RazorpayService.verifyWebhookSignature(rawBody, signature)) {
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }

  // Acknowledge immediately — Razorpay retries if no 200 within ~5s
  res.status(200).json({ received: true });

  // Process asynchronously after response is sent
  setImmediate(async () => {
    try {
      if (event.event === 'payment.failed') {
        await handlePaymentFailed(event.payload?.payment?.entity);
      } else if (event.event === 'payment.captured') {
        await handlePaymentCaptured(event.payload?.payment?.entity);
      }
    } catch (err) {
      console.error('Webhook async processing error:', err);
    }
  });
};

const handlePaymentFailed = async (payment: any): Promise<void> => {
  if (!payment?.id || !payment?.email) return;

  // Idempotency: skip if already recorded
  const existing = await prisma.failedPayment.findUnique({
    where: { paymentId: payment.id },
  });
  if (existing) return;

  // Find the user by email (V1: single-merchant, user email matches customer email)
  // For multi-merchant V2: read userId from payment.notes.userId
  const user = await prisma.user.findFirst({
    where: { email: payment.email },
  });
  if (!user) return;

  await PaymentService.createFailedPayment(user.id, {
    paymentId: payment.id,
    orderId: payment.order_id,
    amount: payment.amount,
    currency: payment.currency || 'INR',
    customerEmail: payment.email,
    customerPhone: payment.contact,
    customerName: payment.notes?.name,
    metadata: JSON.stringify(payment),
  });

  await AuditService.log(user.id, 'PAYMENT_FAILED_RECEIVED', 'FailedPayment', payment.id, {
    amount: payment.amount,
    email: payment.email,
  });
};

const handlePaymentCaptured = async (payment: any): Promise<void> => {
  if (!payment?.id) return;

  // Match by paymentId OR orderId (customer may have retried with a new payment ID)
  const failed = await prisma.failedPayment.findFirst({
    where: {
      status: 'pending',
      OR: [
        { paymentId: payment.id },
        ...(payment.order_id ? [{ orderId: payment.order_id }] : []),
      ],
    },
  });
  if (!failed) return;

  await PaymentService.markRecovered(failed.id);
  await AuditService.log(failed.userId, 'PAYMENT_RECOVERED', 'FailedPayment', failed.id, {
    recoveredPaymentId: payment.id,
  });
};
