import pino from 'pino';

const logger = pino({ transport: { target: 'pino-pretty', options: { colorize: true } } });

/**
 * Returns true when all three Twilio env vars are present.
 */
function isTwilioConfigured(): boolean {
  return !!(
    process.env.TWILIO_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  );
}

/**
 * Lazily builds a Twilio client only when credentials are present.
 * Avoids import-time crash if the SDK is installed but credentials are missing.
 */
async function getTwilioClient() {
  const { default: twilio } = await import('twilio');
  return twilio(process.env.TWILIO_SID!, process.env.TWILIO_AUTH_TOKEN!);
}

/**
 * Service for sending recovery SMS / WhatsApp messages.
 * Channels:
 *   - SMS:       TWILIO_FROM_NUMBER must be a plain E.164 number (e.g. +15005550006)
 *   - WhatsApp:  TWILIO_FROM_NUMBER must be prefixed whatsapp:+1... (Twilio sandbox or approved sender)
 *
 * When Twilio is not configured the message is printed to the console so local
 * development and CI never fail silently.
 */
export class SmsService {
  static async sendRecoverySms(
    phoneNumber: string,
    customerName: string,
    amount: number,
    currency: string,
    link: string
  ): Promise<void> {
    const formattedAmount = (amount / 100).toFixed(2);
    const body = `Hi ${customerName}, your ${currency} ${formattedAmount} payment failed. Complete it here: ${link}`;

    if (!isTwilioConfigured()) {
      logger.info({ phoneNumber, body }, '[DEV SMS — not sent, configure TWILIO_* env vars to send]');
      return;
    }

    try {
      const client = await getTwilioClient();
      const message = await client.messages.create({
        body,
        from: process.env.TWILIO_FROM_NUMBER!,
        to: phoneNumber,
      });
      logger.info({ sid: message.sid, phoneNumber }, 'SMS recovery sent via Twilio');
    } catch (err: any) {
      // Log and swallow — a failed SMS must not abort the recovery job.
      // The email was already dispatched; SMS is a best-effort second channel.
      logger.error({ err: err?.message, phoneNumber }, 'Twilio SMS send failed');
    }
  }

  static async sendRecoveryWhatsApp(
    phoneNumber: string,
    customerName: string,
    amount: number,
    currency: string,
    link: string
  ): Promise<void> {
    const formattedAmount = (amount / 100).toFixed(2);
    const body = `*Payment Failed*\nHi ${customerName}, your ${currency} ${formattedAmount} payment failed. Complete your order here: ${link}`;

    // WhatsApp via Twilio uses the same Messages API with whatsapp: prefix.
    const from = process.env.TWILIO_WHATSAPP_FROM || process.env.TWILIO_FROM_NUMBER;

    if (!isTwilioConfigured() || !from?.startsWith('whatsapp:')) {
      logger.info({ phoneNumber, body }, '[DEV WHATSAPP — not sent, configure TWILIO_WHATSAPP_FROM env var]');
      return;
    }

    try {
      const client = await getTwilioClient();
      const message = await client.messages.create({
        body,
        from,
        to: `whatsapp:${phoneNumber}`,
      });
      logger.info({ sid: message.sid, phoneNumber }, 'WhatsApp recovery sent via Twilio');
    } catch (err: any) {
      logger.error({ err: err?.message, phoneNumber }, 'Twilio WhatsApp send failed');
    }
  }
}
