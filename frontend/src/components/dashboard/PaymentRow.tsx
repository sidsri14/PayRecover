import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, RotateCcw, Lock } from 'lucide-react';
import { StatusBadge } from './Badges';

import { formatAmount, daysSince } from '../../utils/format';

interface PaymentRowProps {
  payment: {
    id: string;
    customerName?: string;
    customerEmail: string;
    amount: number;
    currency: string;
    status: string;
    retryCount: number;
    createdAt: string;
    paymentId?: string;
    recoveredVia?: string;
    recoveryLinks?: { url: string }[];
  };
  isPaid: boolean;
  onRetry: (id: string) => void;
  onUpgrade: () => void;
  onView: (id: string) => void;
}

export const PaymentRow: React.FC<PaymentRowProps> = React.memo(({
  payment, isPaid, onRetry, onUpgrade, onView
}) => {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-300"
    >
      <div className="flex items-center p-5 sm:px-8 gap-6">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onView(payment.id)}>
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <h4 className="text-base font-bold truncate group-hover:underline text-black dark:text-white transition-all">
              {payment.customerName || payment.customerEmail}
            </h4>
            <StatusBadge status={payment.status} />
            <span className="text-base font-bold text-stone-700 dark:text-stone-300">
              {formatAmount(payment.amount, payment.currency)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs font-medium text-stone-400">
            <span className="flex items-center gap-1">
               {payment.customerEmail}
            </span>
            <span>Created {daysSince(payment.createdAt)}d ago</span>
            {payment.status === 'pending' && (
              <span className={cn(
                "font-bold",
                daysSince(payment.createdAt) > 7 ? "text-rose-500" : "text-stone-400"
              )}>
                Due in {daysSince(payment.createdAt)}d
              </span>
            )}
            {payment.paymentId && (
              <span className="font-mono text-[10px] text-stone-300">{payment.paymentId}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onView(payment.id); }}
            className="p-2 text-stone-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-500/10 transition-all"
            aria-label="View Invoice"
            title="View Invoice"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          
          {['pending', 'overdue'].includes(payment.status) && (
            isPaid ? (
              <button
                onClick={e => { e.stopPropagation(); onRetry(payment.id); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 border border-warm-border dark:border-stone-700 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-all"
                aria-label="Send reminder"
                title="Send reminder"
              >
                <RotateCcw className="w-3 h-3" /> Remind
              </button>
            ) : (
              <button
                onClick={e => { e.stopPropagation(); onUpgrade(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-400 border border-dashed border-stone-300 dark:border-stone-600 rounded-lg hover:border-emerald-400 hover:text-emerald-600 transition-all"
                aria-label="Upgrade to unlock reminders"
                title="Upgrade to unlock reminders"
              >
                <Lock className="w-3 h-3" /> Remind
              </button>
            )
          )}
        </div>
      </div>
    </motion.li>
  );
});
