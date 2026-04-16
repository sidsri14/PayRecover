import pino from 'pino';
import { prisma } from '../utils/prisma.js';
import { enqueueWebhookDelivery } from '../jobs/recovery.queue.js';

const logger = pino({ transport: { target: 'pino-pretty', options: { colorize: true } } });

export type OutboundEvent =
  | 'payment.failed'
  | 'payment.retried'
  | 'payment.recovered'
  | 'payment.abandoned';

/**
 * Enqueues outbound webhook delivery jobs for all active merchant endpoints
 * subscribed to the given event. Each delivery is a durable BullMQ job with
 * exponential backoff (3 attempts, 10s base delay).
 *
 * Dispatch is fire-and-forget: errors are logged but never thrown so the
 * calling recovery/webhook flow is never interrupted.
 */
export class OutboundWebhookService {
  static async dispatch(userId: string, event: OutboundEvent, data: object): Promise<void> {
    let endpoints;
    try {
      endpoints = await prisma.webhookEndpoint.findMany({
        where: { userId, active: true, events: { has: event } },
        select: { id: true, url: true, secret: true },
      });
    } catch (err) {
      logger.error({ err, userId, event }, '[Outbound Webhook] DB lookup failed — skipping dispatch');
      return;
    }

    if (!endpoints.length) return;

    const body = JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString(),
    });

    await Promise.allSettled(
      endpoints.map(ep =>
        enqueueWebhookDelivery({
          endpointId: ep.id,
          url: ep.url,
          secret: ep.secret,
          event,
          body,
        }).catch(err =>
          logger.error({ err, endpointId: ep.id, event }, '[Outbound Webhook] Failed to enqueue delivery job')
        )
      )
    );
  }
}
