import { Prisma } from '@prisma/client';
import pino from 'pino';
import { prisma } from '../utils/prisma.js';
import { logAuditAction } from './audit.service.js';
import { OutboundWebhookService } from './OutboundWebhookService.js';

const logger = pino({ transport: { target: 'pino-pretty', options: { colorize: true } } });

export type FailedPaymentWithLinks = Prisma.FailedPaymentGetPayload<{
  include: { recoveryLinks: { orderBy: { createdAt: 'desc' }, take: 1 } }
}>;

const ZERO_METRICS = {
  failedAmount: 0, recoveredAmount: 0, recoveryRate: 0,
  recoveredThisWeek: 0, recoveredThisMonth: 0, recoveredViaLink: 0,
  totalClicks: 0,
};

// Exported so recovery.processor.ts can schedule BullMQ jobs with the same delays.
// Index = current retryCount (before increment): [0→retry1 after 24h, 1→retry2 after 72h]
export const RETRY_DELAYS_MS = [24 * 60 * 60 * 1000, 72 * 60 * 60 * 1000] as const;

const SORTABLE_FIELDS = ['status', 'amount', 'createdAt', 'retryCount'] as const;
type SortKey = typeof SORTABLE_FIELDS[number];

/** Retrieves a paginated list of failed payments with optional filters. */
export const getPaymentsList = async (userId: string, { status, sourceId, search, page = 1, limit = 50, sortKey = 'createdAt', sortDir = 'desc' }: any = {}) => {
  const resolvedSortKey: SortKey = SORTABLE_FIELDS.includes(sortKey) ? sortKey : 'createdAt';
  const resolvedSortDir: 'asc' | 'desc' = sortDir === 'asc' ? 'asc' : 'desc';

  const safeSearch = search ? String(search).slice(0, 200) : undefined;

  const where: Prisma.FailedPaymentWhereInput = {
    userId,
    ...(status && { status }),
    ...(sourceId && { sourceId }),
    ...(safeSearch && { OR: [
      { customerEmail: { contains: safeSearch } },
      { paymentId: { contains: safeSearch } },
      { customerName: { contains: safeSearch } },
    ]}),
  };

  const [payments, total] = await Promise.all([
    prisma.failedPayment.findMany({
      where, orderBy: { [resolvedSortKey]: resolvedSortDir }, skip: (page - 1) * limit, take: limit,
      include: { recoveryLinks: { orderBy: { createdAt: 'desc' }, take: 1 } },
    }),
    prisma.failedPayment.count({ where }),
  ]);

  return { payments, total, page, limit, pages: Math.ceil(total / limit) };
};

export const getPaymentDetails = (userId: string, id: string) => 
  prisma.failedPayment.findFirstOrThrow({
    where: { id, userId },
    include: {
      recoveryLinks: { orderBy: { createdAt: 'desc' } },
      reminders: { orderBy: { sentAt: 'desc' } },
      event: true,
    },
  });

export const markPaymentRecovered = async (failedPaymentId: string, userId: string, via: 'link' | 'external' = 'link') => {
  const updated = await prisma.failedPayment.update({
    where: { id: failedPaymentId },
    data: { status: 'recovered', recoveredAt: new Date(), recoveredVia: via },
  });
  await logAuditAction(userId, 'PAYMENT_RECOVERED', 'FailedPayment', failedPaymentId, { via });
  void OutboundWebhookService.dispatch(userId, 'payment.recovered', {
    id: updated.id, paymentId: updated.paymentId, amount: updated.amount,
    currency: updated.currency, status: updated.status, recoveredAt: updated.recoveredAt, recoveredVia: via,
  }).catch(() => {});
};

export const triggerManualRetry = async (userId: string, id: string) => {
  const p = await prisma.failedPayment.findFirst({ where: { id, userId } });
  if (!p) throw { status: 404, message: 'Payment not found' };
  if (!['pending', 'retrying'].includes(p.status)) throw { status: 400, message: 'Invalid status' };
  await prisma.failedPayment.update({ where: { id }, data: { nextRetryAt: new Date() } });
};

/** Retrieves metrics for the dashboard focused on Invoices. */
export const getInvoiceMetrics = async (userId: string) => {
  try {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [statsByStatus, monthPaid] = await Promise.all([
      prisma.invoice.groupBy({
        by: ['status'],
        where: { userId },
        _sum: { amount: true },
        _count: true 
      }),
      prisma.invoice.aggregate({
        where: { userId, status: 'paid', updatedAt: { gte: monthAgo } },
        _sum: { amount: true }
      }),
    ]);

    const stats = Object.fromEntries(statsByStatus.map(s => [s.status, { volume: s._sum.amount ?? 0, count: s._count }]));
    const totalVolume = Object.values(stats).reduce((acc, s) => acc + s.volume, 0);
    const paidVolume = stats['paid']?.volume ?? 0;

    return {
      totalVolume,
      paidVolume,
      paidRate: totalVolume > 0 ? (paidVolume / totalVolume) : 0,
      paidThisMonth: monthPaid._sum.amount ?? 0,
      counts: {
        pending: stats['pending']?.count ?? 0,
        paid: stats['paid']?.count ?? 0,
        overdue: stats['overdue']?.count ?? 0,
        abandoned: stats['abandoned']?.count ?? 0,
      }
    };
  } catch (err) {
    logger.error({ err }, 'Failed to compute invoice metrics');
    return { totalVolume: 0, paidVolume: 0, paidRate: 0, paidThisMonth: 0, counts: { pending: 0, paid: 0, overdue: 0, abandoned: 0 } };
  }
};

export const getTimeseriesMetrics = async (userId: string, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const invoices = await prisma.invoice.findMany({
    where: { userId, createdAt: { gte: startDate } },
    select: { amount: true, status: true, createdAt: true }
  });

  const timeseriesMap = new Map<string, { date: string, volume: number, paid: number }>();
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0] as string;
    timeseriesMap.set(dateStr, { date: dateStr, volume: 0, paid: 0 });
  }

  invoices.forEach(inv => {
    const dateStr = inv.createdAt.toISOString().split('T')[0] as string;
    const stat = timeseriesMap.get(dateStr);
    if (stat) {
      stat.volume += inv.amount;
      if (inv.status === 'paid') stat.paid += inv.amount;
    }
  });

  return Array.from(timeseriesMap.values());
};

export const getFullDashboardStats = async (userId: string) => {
  const m = await getInvoiceMetrics(userId);
  const timeseries = await getTimeseriesMetrics(userId, 30);

  return {
    totalVolume: m.totalVolume,
    paidVolume: m.paidVolume,
    paidRate: Math.round(m.paidRate * 1000) / 10, // decimal → percentage
    paidThisMonth: m.paidThisMonth,
    counts: m.counts,
    timeseries
  };
};
